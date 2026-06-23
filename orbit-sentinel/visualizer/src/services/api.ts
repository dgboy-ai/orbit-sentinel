export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '';
const FETCH_TIMEOUT = 90000; // 90 seconds to handle Render backend cold start
const CACHE_TTL = 5 * 60 * 1000; // 5-minute API cache

interface CacheEntry {
  data: unknown;
  expiry: number;
}

const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  if (cache.size > 50) {
    const first = cache.keys().next();
    if (!first.done) cache.delete(first.value);
  }
}

export interface RequestValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRequest(params: {
  projectId?: number;
  projectPath?: string;
  mrIid?: number;
  mrTitle?: string;
  changedFiles?: string[];
  changeDescription?: string;
}): RequestValidationResult {
  const errors: string[] = [];

  if (params.projectId !== undefined && (typeof params.projectId !== 'number' || params.projectId < 0)) {
    errors.push('Project ID must be a non-negative number.');
  }
  if (!params.projectPath || typeof params.projectPath !== 'string' || params.projectPath.trim() === '') {
    errors.push('Project path is required.');
  }
  if (!params.mrIid || typeof params.mrIid !== 'number' || params.mrIid <= 0) {
    errors.push('Merge Request IID must be a positive number.');
  }
  if (!params.mrTitle || typeof params.mrTitle !== 'string' || params.mrTitle.trim() === '') {
    errors.push('Merge Request Title is required.');
  }
  if (!params.changedFiles || !Array.isArray(params.changedFiles)) {
    errors.push('Changed files must be an array.');
  }
  if (!params.changeDescription || typeof params.changeDescription !== 'string' || params.changeDescription.trim() === '') {
    errors.push('Change description is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateGitLabToken(token: string): boolean {
  if (!token) return false;
  return token.startsWith('glpat-') && token.length >= 20;
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Request-Source': 'OrbitSentinelVisualizer',
};

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  const headers = {
    ...SECURITY_HEADERS,
    ...options.headers,
  };

  try {
    return await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

export const apiService = {
  async analyzeChange(params: {
    projectId: number;
    projectPath: string;
    mrIid: number;
    mrTitle: string;
    changedFiles: string[];
    changeDescription: string;
    branch?: string;
  }): Promise<any> {
    const validation = validateRequest(params);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(' ')}`);
    }

    const cacheKey = `analyze:${params.projectPath}:${params.mrIid}:${JSON.stringify(params.changedFiles)}`;
    const cached = getCached<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        let errData: any;
        try {
          errData = await response.json();
        } catch {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        
        const details = errData.recoveryAction ? ` Recovery Action: ${errData.recoveryAction}` : '';
        const codeMsg = errData.gitLabErrorCode ? ` [Code: ${errData.gitLabErrorCode}]` : '';
        throw new Error(`${errData.error || 'Failed to analyze change'}${codeMsg}.${details}`);
      }

      const data = await response.json();
      setCache(cacheKey, data);
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Analysis request timed out. Please check the network connectivity or try again.');
      }
      throw err;
    }
  },

  async getDemoData(): Promise<any> {
    const cacheKey = 'demo';
    const cached = getCached<any>(cacheKey);
    if (cached) return cached;

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/demo`);
    if (!response.ok) throw new Error('Engine demo endpoint unreachable');
    
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  },

  isApiAvailable(): boolean {
    return !!API_BASE_URL && API_BASE_URL !== 'https://your-engine-domain.com';
  },
};

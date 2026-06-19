const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '';
const FETCH_TIMEOUT = 15000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze change');
    }
    return response.json();
  },

  async getDemoData(): Promise<any> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/demo`);
    if (!response.ok) throw new Error('Engine demo endpoint unreachable');
    return response.json();
  },

  isApiAvailable(): boolean {
    return !!API_BASE_URL && API_BASE_URL !== 'https://your-engine-domain.com';
  },
};

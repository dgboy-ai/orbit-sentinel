export enum ErrorType {
  ORBIT_API_ERROR = 'ORBIT_API_ERROR',
  INVALID_MR = 'INVALID_MR',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export enum GitLabErrorCode {
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  MR_NOT_FOUND = 'MR_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT'
}

export interface SentinelError {
  message: string;
  type: ErrorType;
  statusCode?: number;
  retryAfter?: number;
  originalError?: Error;
  timestamp: string;
  gitLabErrorCode?: GitLabErrorCode;
  recoveryAction?: string;
}

export class OrbitSentinelError extends Error {
  public originalError?: Error;

  constructor(
    message: string,
    public type: ErrorType,
    public statusCode?: number,
    public retryAfter?: number,
    originalError?: Error,
    public gitLabErrorCode?: GitLabErrorCode,
    public recoveryAction?: string
  ) {
    super(message);
    this.name = 'OrbitSentinelError';
    this.originalError = originalError;
  }
}

export class GitLabErrorHandler {
  static mapError(statusCode: number, message: string, context?: string): { code: GitLabErrorCode; recovery: string } {
    const msgLower = message.toLowerCase();
    const ctxLower = (context || '').toLowerCase();
    const combined = `${msgLower} ${ctxLower}`;

    if (statusCode === 404) {
      if (combined.includes('mr') || combined.includes('merge request') || combined.includes('merge_request') || combined.includes('iid')) {
        return {
          code: GitLabErrorCode.MR_NOT_FOUND,
          recovery: 'Verify that the merge request ID is correct and belongs to the project.'
        };
      }
      return {
        code: GitLabErrorCode.PROJECT_NOT_FOUND,
        recovery: 'Verify that the project path is correct and exists on GitLab.'
      };
    }

    if (statusCode === 403) {
      return {
        code: GitLabErrorCode.INSUFFICIENT_PERMISSIONS,
        recovery: 'Ensure the GitLab token has sufficient permissions (read_api scope) for this repository.'
      };
    }

    if (statusCode === 429) {
      return {
        code: GitLabErrorCode.RATE_LIMIT_EXCEEDED,
        recovery: 'GitLab API rate limit exceeded. Please wait and try again later.'
      };
    }

    if (statusCode === 401) {
      return {
        code: GitLabErrorCode.TOKEN_INVALID,
        recovery: 'Provide a valid GitLab personal access token.'
      };
    }

    if (statusCode >= 500 && statusCode < 600) {
      return {
        code: GitLabErrorCode.NETWORK_TIMEOUT,
        recovery: 'GitLab service is temporarily unavailable or timed out. Please try again later.'
      };
    }

    // Default mapping for other status codes
    if (combined.includes('timeout') || combined.includes('abort') || combined.includes('network') || combined.includes('fetch')) {
      return {
        code: GitLabErrorCode.NETWORK_TIMEOUT,
        recovery: 'Check connection and retry.'
      };
    }

    // Fallback default
    return {
      code: GitLabErrorCode.NETWORK_TIMEOUT,
      recovery: 'An unexpected connection issue occurred. Please check network connectivity.'
    };
  }

  static handleError(error: Error | unknown, context?: string): SentinelError {
    const timestamp = new Date().toISOString();
    
    if (error instanceof OrbitSentinelError) {
      return {
        message: error.message,
        type: error.type,
        statusCode: error.statusCode,
        retryAfter: error.retryAfter,
        originalError: error.originalError,
        gitLabErrorCode: error.gitLabErrorCode,
        recoveryAction: error.recoveryAction,
        timestamp
      };
    }

    const err = error as { statusCode?: number; response?: { status?: number }; message?: string };
    const statusCode = err.statusCode || err.response?.status;
    const message = err.message || (typeof error === 'string' ? error : 'Unknown error');
    
    if (statusCode) {
      const { code, recovery } = this.mapError(statusCode, message, context);
      
      let type = ErrorType.ORBIT_API_ERROR;
      if (code === GitLabErrorCode.RATE_LIMIT_EXCEEDED) type = ErrorType.RATE_LIMIT;
      else if (code === GitLabErrorCode.TOKEN_INVALID) type = ErrorType.AUTHENTICATION_ERROR;
      else if (code === GitLabErrorCode.INSUFFICIENT_PERMISSIONS) type = ErrorType.AUTHENTICATION_ERROR;
      else if (code === GitLabErrorCode.NETWORK_TIMEOUT) type = ErrorType.NETWORK_ERROR;

      return {
        message,
        type,
        statusCode,
        gitLabErrorCode: code,
        recoveryAction: recovery,
        timestamp
      };
    }

    // If no statusCode, check messages for keywords
    const msgLower = message.toLowerCase();
    if (msgLower.includes('timeout') || msgLower.includes('network') || msgLower.includes('connection')) {
      return {
        message,
        type: ErrorType.NETWORK_ERROR,
        gitLabErrorCode: GitLabErrorCode.NETWORK_TIMEOUT,
        recoveryAction: 'Check connection and retry.',
        timestamp
      };
    }

    return {
      message,
      type: ErrorType.ORBIT_API_ERROR,
      timestamp
    };
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private rateLimitResetTimes: Map<string, number> = new Map();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | OrbitSentinelError | unknown, context?: string): SentinelError {
    const timestamp = new Date().toISOString();
    let sentinelError: SentinelError;

    if (error instanceof OrbitSentinelError) {
      sentinelError = {
        message: error.message,
        type: error.type,
        statusCode: error.statusCode,
        retryAfter: error.retryAfter,
        originalError: error.originalError,
        gitLabErrorCode: error.gitLabErrorCode,
        recoveryAction: error.recoveryAction,
        timestamp
      };
    } else if (error instanceof Error) {
      sentinelError = this.classifyError(error, context);
    } else if (error && typeof error === 'object' && 'message' in error) {
      sentinelError = {
        message: String((error as { message: string }).message),
        type: ErrorType.ORBIT_API_ERROR,
        timestamp
      };
    } else {
      sentinelError = {
        message: 'Unknown error occurred',
        type: ErrorType.NETWORK_ERROR,
        timestamp
      };
    }

    this.logError(sentinelError, context);
    this.checkRateLimit(sentinelError, context);

    return sentinelError;
  }

  private classifyError(error: Error, context?: string): SentinelError {
    const message = error.message.toLowerCase();
    const err = error as { statusCode?: number; response?: { status?: number } };
    const statusCode = err.statusCode || err.response?.status;

    if (statusCode) {
      const { code, recovery } = GitLabErrorHandler.mapError(statusCode, error.message, context);
      
      let type = ErrorType.ORBIT_API_ERROR;
      let retryAfter: number | undefined;

      if (code === GitLabErrorCode.RATE_LIMIT_EXCEEDED) {
        type = ErrorType.RATE_LIMIT;
        retryAfter = parseInt(error.message.match(/retry after (\d+)/)?.[1] || '60');
      } else if (code === GitLabErrorCode.TOKEN_INVALID || code === GitLabErrorCode.INSUFFICIENT_PERMISSIONS) {
        type = ErrorType.AUTHENTICATION_ERROR;
      } else if (code === GitLabErrorCode.NETWORK_TIMEOUT) {
        type = ErrorType.NETWORK_ERROR;
      }

      return {
        message: error.message,
        type,
        statusCode,
        retryAfter,
        gitLabErrorCode: code,
        recoveryAction: recovery,
        timestamp: new Date().toISOString()
      };
    }

    if (message.includes('network') || message.includes('connection')) {
      return {
        message: 'Network connection error. Please check your internet connection.',
        type: ErrorType.NETWORK_ERROR,
        gitLabErrorCode: GitLabErrorCode.NETWORK_TIMEOUT,
        recoveryAction: 'Check connection and retry.',
        timestamp: new Date().toISOString()
      };
    }

    if (message.includes('quota') || message.includes('limit')) {
      return {
        message: 'API quota exceeded. Please try again later.',
        type: ErrorType.QUOTA_EXCEEDED,
        timestamp: new Date().toISOString()
      };
    }

    return {
      message: error.message || 'An unexpected error occurred.',
      type: ErrorType.ORBIT_API_ERROR,
      timestamp: new Date().toISOString()
    };
  }

  private logError(error: SentinelError, context?: string): void {
    const logEntry = {
      timestamp: error.timestamp,
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      context,
      retryAfter: error.retryAfter,
      gitLabErrorCode: error.gitLabErrorCode,
      recoveryAction: error.recoveryAction
    };

    console.error('[OrbitSentinel]', logEntry);

    if (error.type === ErrorType.RATE_LIMIT) {
      console.warn('[Rate Limit]', `Retry after ${error.retryAfter} seconds`);
    }
  }

  private checkRateLimit(error: SentinelError, context?: string): void {
    if (error.type === ErrorType.RATE_LIMIT) {
      const key = context || 'global';
      this.rateLimitResetTimes.set(key, Date.now() + (error.retryAfter || 60) * 1000);
    }

    if (this.isRateLimited(context)) {
      throw new OrbitSentinelError(
        'Too many requests. Please wait before trying again.',
        ErrorType.RATE_LIMIT,
        429,
        Math.ceil((this.rateLimitResetTimes.get(context || 'global') || 0) - Date.now()) / 1000,
        undefined,
        GitLabErrorCode.RATE_LIMIT_EXCEEDED,
        'GitLab API rate limit exceeded. Please wait and try again later.'
      );
    }
  }

  isRateLimited(context?: string): boolean {
    const key = context || 'global';
    const resetTime = this.rateLimitResetTimes.get(key);
    if (!resetTime) return false;
    return Date.now() < resetTime;
  }

  getRetryAfter(context?: string): number {
    const key = context || 'global';
    const resetTime = this.rateLimitResetTimes.get(key);
    if (!resetTime) return 0;
    return Math.ceil((resetTime - Date.now()) / 1000);
  }

  incrementErrorCount(context: string): void {
    const count = this.errorCounts.get(context) || 0;
    this.errorCounts.set(context, count + 1);

    if (count > 10) {
      console.warn(`[ErrorCount] High error rate for ${context}: ${count} errors`);
    }
  }

  getErrorCount(context: string): number {
    return this.errorCounts.get(context) || 0;
  }
}

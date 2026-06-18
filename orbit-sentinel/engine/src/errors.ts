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

export interface SentinelError {
  message: string;
  type: ErrorType;
  statusCode?: number;
  retryAfter?: number;
  originalError?: Error;
  timestamp: string;
}

export class OrbitSentinelError extends Error {
  public originalError?: Error;

  constructor(
    message: string,
    public type: ErrorType,
    public statusCode?: number,
    public retryAfter?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'OrbitSentinelError';
    this.originalError = originalError;
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
        timestamp
      };
    } else if (error instanceof Error) {
      sentinelError = this.classifyError(error, context);
    } else if (error && typeof error === 'object' && 'message' in error) {
      sentinelError = {
        message: String((error as any).message),
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
    const statusCode = (error as any).statusCode || (error as any).response?.status;

    if (statusCode === 429) {
      return {
        message: 'Rate limit exceeded. Please try again later.',
        type: ErrorType.RATE_LIMIT,
        statusCode,
        retryAfter: parseInt(error.message.match(/retry after (\d+)/)?.[1] || '60'),
        timestamp: new Date().toISOString()
      };
    }

    if (statusCode === 401 || statusCode === 403) {
      return {
        message: 'Authentication failed. Please check your GitLab token.',
        type: ErrorType.AUTHENTICATION_ERROR,
        statusCode,
        timestamp: new Date().toISOString()
      };
    }

    if (statusCode === 404) {
      return {
        message: 'Requested resource not found.',
        type: ErrorType.ORBIT_API_ERROR,
        statusCode,
        timestamp: new Date().toISOString()
      };
    }

    if (statusCode >= 500) {
      return {
        message: 'GitLab Orbit service is temporarily unavailable.',
        type: ErrorType.SERVICE_UNAVAILABLE,
        statusCode,
        timestamp: new Date().toISOString()
      };
    }

    if (message.includes('network') || message.includes('connection')) {
      return {
        message: 'Network connection error. Please check your internet connection.',
        type: ErrorType.NETWORK_ERROR,
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
      retryAfter: error.retryAfter
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
        Math.ceil((this.rateLimitResetTimes.get(context || 'global') || 0) - Date.now()) / 1000
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

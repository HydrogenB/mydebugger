/**
 * Common types used throughout the application
 */

/**
 * Result type for async operations
 */
export type Result<T> = {
  data?: T;
  error?: Error;
  isLoading: boolean;
};

/**
 * Generic pagination type
 */
export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark';

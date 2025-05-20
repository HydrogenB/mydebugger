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

/**
 * Interface for a single tool
 */
export interface Tool {
  name: string;
  path: string;
  description?: string;
  // icon?: React.ElementType; // Optional: if you want icons for tools
}

/**
 * Interface for a category of tools
 */
export interface ToolCategory {
  name: string;
  description: string;
  tools: Tool[];
  // icon?: React.ElementType; // Optional: if you want icons for categories
}

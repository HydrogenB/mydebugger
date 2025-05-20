/**
 * Model representing a tool category
 */
export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Model representing a tool
 */
export interface Tool {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  route: string;
  isNew?: boolean;
  isPopular?: boolean;
}

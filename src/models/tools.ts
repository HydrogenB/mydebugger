/**
 * © 2025 MyDebugger Contributors – MIT License
 */

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

/**
 * List of currently available tools in the application
 */
export const availableTools: Tool[] = [
  {
    id: 'link-tracer',
    name: 'Link Tracer',
    description: 'Trace the complete redirect path of any URL.',
    categoryId: 'utilities',
    route: '/tools/link-tracer',
    isNew: true,
  },
];

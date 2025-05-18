import { ComponentCategory } from '../types';

/**
 * Get display name for component category
 * @param category The component category
 * @returns A formatted display name
 */
export const getCategoryDisplayName = (category: ComponentCategory | 'all'): string => {
  switch (category) {
    case 'all':
      return 'All Components';
    case 'layout':
      return 'Layout';
    case 'display':
      return 'Display';
    case 'input':
      return 'Input';
    case 'navigation':
      return 'Navigation';
    case 'feedback':
      return 'Feedback';
    case 'overlay':
      return 'Overlays';
    default:
      return category;
  }
};

/**
 * Get color for category badge
 * @param category The component category
 * @returns CSS classes for the badge
 */
export const getCategoryColor = (category: ComponentCategory): string => {
  switch (category) {
    case 'layout':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'display':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'input':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'navigation':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'feedback':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'overlay':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

/**
 * Convert component path to import statement
 * @param path Path to the component in design system
 * @returns Import statement for the component
 */
export const getComponentImportStatement = (path: string): string => {
  const parts = path.split('/');
  const componentName = parts[parts.length - 1];
  
  return `import { ${componentName} } from '@/${path}';`;
};

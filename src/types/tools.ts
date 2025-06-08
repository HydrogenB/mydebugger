import React from 'react';

/**
 * Tool category types supported by the application
 */
export type ToolCategory = 
  | 'Testing' 
  | 'Security' 
  | 'Encoding' 
  | 'Utilities' 
  | 'Development'
  | 'Formatters';

/**
 * Tool interface representing a tool in the application
 */
export interface Tool {
  id: string;
  route: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: ToolCategory;
  isPopular?: boolean;
  isBeta?: boolean;
  isNew?: boolean;
  metadata: {
    keywords: string[];
    learnMoreUrl?: string;
    relatedTools?: string[];
  };
  uiOptions?: {
    showExamples?: boolean;
    fullWidth?: boolean;
  };
}

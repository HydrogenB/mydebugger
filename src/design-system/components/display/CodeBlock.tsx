/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';

export interface CodeBlockProps {
  /** Code content to display */
  children: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** Max height for scrollable area */
  maxHeight?: string | number;
}

/**
 * CodeBlock - Consistent styling for code or log output.
 * Adds overflow scrolling and responsive theming.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className = '',
  maxHeight = '16rem',
}) => (
  <pre
    className={`bg-gray-100 dark:bg-gray-900 text-sm rounded p-4 overflow-x-auto whitespace-pre-wrap ${className}`}
    style={{ maxHeight }}
  >
    {children}
  </pre>
);

export default CodeBlock;

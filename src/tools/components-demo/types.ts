/**
 * Type definitions for the Components Demo tool
 */

/**
 * Component demo category
 */
export type ComponentCategory = 
  | 'layout' 
  | 'display' 
  | 'input' 
  | 'navigation' 
  | 'feedback'
  | 'overlay';

/**
 * Demo component interface
 */
export interface DemoComponent {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  path: string;  // import path in design system
}

/**
 * Component example code
 */
export interface CodeExample {
  title: string;
  description: string;
  code: string;
  preview?: React.ReactNode;
}

/**
 * Demo section interface
 */
export interface DemoSection {
  id: string;
  title: string;
  components: DemoComponent[];
}

import React, { ReactNode } from 'react';

export type ContainerWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'none';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ResponsiveContainerProps {
  /** The content to be displayed inside the container */
  children: ReactNode;
  /** Maximum width of the container at different breakpoints */
  maxWidth?: ContainerWidth;
  /** Whether to center the container horizontally */
  centered?: boolean;
  /** Padding applied to the container */
  padding?: ContainerPadding;
  /** Custom CSS class */
  className?: string;
  /** Whether to add a responsive gutter around the container */
  withGutter?: boolean;
  /** HTML tag to render the container as */
  as?: 'div' | 'section' | 'article' | 'main';
}

/**
 * ResponsiveContainer - A component for creating consistent, responsive layouts
 * with configurable max-width, padding, and alignment.
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  centered = true,
  padding = 'md',
  className = '',
  withGutter = true,
  as: Component = 'div'
}) => {
  // Max width classes based on breakpoints
  const maxWidthClasses = {
    xs: 'max-w-xs',       // 20rem (320px)
    sm: 'max-w-sm',       // 24rem (384px)
    md: 'max-w-md',       // 28rem (448px)
    lg: 'max-w-lg',       // 32rem (512px)
    xl: 'max-w-xl',       // 36rem (576px)
    '2xl': 'max-w-2xl',   // 42rem (672px)
    '3xl': 'max-w-3xl',   // 48rem (768px)
    '4xl': 'max-w-4xl',   // 56rem (896px)
    '5xl': 'max-w-5xl',   // 64rem (1024px)
    '6xl': 'max-w-6xl',   // 72rem (1152px)
    '7xl': 'max-w-7xl',   // 80rem (1280px)
    full: 'max-w-full',   // 100%
    none: ''              // No max width
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-4',
    lg: 'px-6 py-8',
    xl: 'px-8 py-12'
  };

  // Gutter classes (responsive spacing on the outside of the container)
  const gutterClass = withGutter ? 'mx-4 md:mx-6 lg:mx-8' : '';

  // Container classes
  const containerClasses = [
    maxWidth !== 'none' ? maxWidthClasses[maxWidth] : '',
    centered ? 'mx-auto' : '',
    padding !== 'none' ? paddingClasses[padding] : '',
    withGutter ? gutterClass : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={containerClasses}>
      {children}
    </Component>
  );
};
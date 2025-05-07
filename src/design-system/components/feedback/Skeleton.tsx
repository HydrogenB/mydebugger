import React from 'react';

export interface SkeletonProps {
  /** Type of skeleton to display */
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button' | 'image';
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Whether to animate the skeleton */
  animate?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Border radius of the skeleton */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Number of skeleton items to render in a group */
  count?: number;
  /** Gap between multiple skeletons when count > 1 */
  gap?: string | number;
}

/**
 * Skeleton - A component for displaying a placeholder preview of content while data is loading
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animate = true,
  className = '',
  radius = 'md',
  count = 1,
  gap = '0.5rem',
}) => {
  // Base classes
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  // Animation classes
  const animationClass = animate ? 'animate-pulse' : '';
  
  // Border radius classes
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  
  // Get width and height styles
  const getStyleProps = () => {
    const styles: React.CSSProperties = {};
    
    if (width) {
      styles.width = typeof width === 'number' ? `${width}px` : width;
    }
    
    if (height) {
      styles.height = typeof height === 'number' ? `${height}px` : height;
    }
    
    return styles;
  };
  
  // Generate variant-specific styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return `h-4 w-2/3 ${radiusClasses['sm']}`;
      case 'circular':
        return `h-10 w-10 ${radiusClasses['full']}`;
      case 'rectangular':
        return `h-20 w-full ${radiusClasses[radius]}`;
      case 'card':
        return `h-40 w-full ${radiusClasses[radius]}`;
      case 'avatar':
        return `h-12 w-12 ${radiusClasses['full']}`;
      case 'button':
        return `h-10 w-24 ${radiusClasses[radius]}`;
      case 'image':
        return `h-48 w-full ${radiusClasses[radius]}`;
      default:
        return '';
    }
  };
  
  // Combine all classes
  const skeletonClasses = [
    baseClasses,
    animationClass,
    getVariantClasses(),
    className,
  ].join(' ');
  
  // Style for multiple skeletons
  const containerStyle: React.CSSProperties = count > 1 ? {
    display: 'flex',
    flexDirection: 'column',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
  } : {};
  
  // Generate multiple skeletons
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={skeletonClasses}
      style={getStyleProps()}
      aria-hidden="true"
    />
  ));
  
  // Return single skeleton or container with multiple skeletons
  if (count === 1) {
    return skeletons[0];
  }
  
  return (
    <div style={containerStyle}>
      {skeletons}
    </div>
  );
};

export default Skeleton;
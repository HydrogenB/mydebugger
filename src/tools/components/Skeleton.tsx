import React from 'react';

export type SkeletonVariant = 'text' | 'rectangular' | 'circular' | 'rounded';

export interface SkeletonProps {
  /** Visual style of the skeleton */
  variant?: SkeletonVariant;
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Animation style */
  animation?: 'pulse' | 'wave' | 'none';
  /** Custom CSS class */
  className?: string;
  /** Whether to show the skeleton (helpful for conditional rendering) */
  visible?: boolean;
  /** Number of lines to show when variant is text */
  lines?: number;
  /** Space between text lines */
  lineSpacing?: number;
  /** Optional border radius */
  borderRadius?: string;
}

/**
 * Skeleton - A placeholder preview for content that will load
 * Provides a visual indicator during loading states
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  visible = true,
  lines = 1,
  lineSpacing = 8,
  borderRadius,
}) => {
  // Don't render anything if not visible
  if (!visible) return null;
  
  // Generate an array for multi-line text skeletons
  const lineItems = Array.from({ length: lines }, (_, index) => index);

  // Calculate the width for text lines
  const getTextLineWidth = (index: number) => {
    // Last line is typically shorter
    if (index === lineItems.length - 1 && lines > 1) {
      return { width: width || '70%' };
    }
    return { width: width || '100%' };
  };

  // Create single skeleton element
  const createSkeleton = (key?: number, customStyle?: React.CSSProperties) => {
    // Determine shape styles based on variant
    const variantStyles: React.CSSProperties = {
      ...(variant === 'text' && { height: height || '1em' }),
      ...(variant === 'rectangular' && { height: height || '100px' }),
      ...(variant === 'circular' && { 
        height: height || '40px', 
        width: width || '40px', 
        borderRadius: '50%'
      }),
      ...(variant === 'rounded' && {
        height: height || '40px',
        borderRadius: borderRadius || '0.375rem' // 6px
      }),
      ...(width !== undefined && { width }),
      ...customStyle
    };

    // Determine animation classes
    const animationClass = 
      animation === 'pulse' ? 'animate-pulse' : 
      animation === 'wave' ? 'skeleton-wave' : '';

    // Base skeleton classes
    const skeletonClasses = [
      'bg-gray-200 dark:bg-gray-700',
      animationClass,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div 
        key={key} 
        className={skeletonClasses}
        style={variantStyles}
        aria-hidden="true"
      />
    );
  };

  // Render multi-line text skeleton
  if (variant === 'text' && lines > 1) {
    return (
      <div className="flex flex-col" style={{ gap: `${lineSpacing}px` }}>
        {lineItems.map((index) => (
          createSkeleton(index, getTextLineWidth(index))
        ))}
      </div>
    );
  }

  // Render single skeleton
  return createSkeleton();
};

/**
 * SkeletonGroup - Container for displaying related skeletons
 * Use for content with consistent structure like lists
 */
export interface SkeletonGroupProps {
  /** Number of skeleton rows to show */
  count?: number;
  /** Space between skeleton rows */
  spacing?: number;
  /** Template for each row */
  children: React.ReactNode;
  /** Custom CSS class */
  className?: string;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count = 3,
  spacing = 12,
  children,
  className = '',
}) => {
  return (
    <div 
      className={`flex flex-col ${className}`} 
      style={{ gap: `${spacing}px` }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full">
          {children}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
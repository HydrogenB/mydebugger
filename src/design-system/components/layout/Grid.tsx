import React, { ReactNode } from 'react';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GridResponsiveColumns = {
  base?: GridColumns;
  sm?: GridColumns;
  md?: GridColumns;
  lg?: GridColumns;
  xl?: GridColumns;
  '2xl'?: GridColumns;
};

export interface GridProps {
  /** The content to be displayed inside the grid */
  children: ReactNode;
  /** Number of columns in the grid */
  columns?: GridColumns | GridResponsiveColumns;
  /** Gap between grid items */
  gap?: GridGap | { x?: GridGap; y?: GridGap };
  /** Gap between rows (deprecated, use gap.y instead) */
  rowGap?: GridGap;
  /** Horizontal alignment of items */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  /** Vertical alignment of items */
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  /** Custom CSS class */
  className?: string;
  /** Element to render as */
  as?: 'div' | 'section' | 'ul' | 'ol';
  /** Whether grid items should automatically fill available space */
  autoFill?: boolean;
  /** Minimum width of auto-filled items */
  minChildWidth?: string;
  /** Whether the grid should be responsive to container size */
  containerResponsive?: boolean;
  /** Whether to use auto-rows */
  autoRows?: boolean;
}

/**
 * Grid - A flexible grid layout system with responsive column configurations,
 * alignment options, and adjustable spacing.
 */
export const Grid: React.FC<GridProps> = ({
  children,
  columns = { base: 1, md: 3 },
  gap = 'lg',
  rowGap,
  justify = 'start',
  align = 'stretch',
  className = '',
  as: Component = 'div',
  autoFill = false,
  minChildWidth,
  containerResponsive = false,
  autoRows = false,
}) => {
  // Convert gap to object if it's a string
  const gapObject = typeof gap === 'object' ? gap : { x: gap, y: gap };
  
  // If rowGap is specified, override the y gap
  if (rowGap) {
    gapObject.y = rowGap;
  }

  // Gap classes
  const gapClasses = {
    none: '0',
    xs: '1',
    sm: '2',
    md: '4',
    lg: '6',
    xl: '8',
    '2xl': '12',
  };

  const getGapClass = (gap?: GridGap) => {
    if (!gap || gap === 'none') return '';
    return gapClasses[gap];
  };

  const gapClass = [
    gapObject.x && gapObject.x !== 'none' ? `gap-x-${getGapClass(gapObject.x)}` : '',
    gapObject.y && gapObject.y !== 'none' ? `gap-y-${getGapClass(gapObject.y)}` : '',
  ].filter(Boolean).join(' ');

  // Justify content classes
  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  // Align items classes
  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  // Create grid columns classes
  const getGridColumns = (cols: GridColumns): string => {
    if (cols === 'none') return '';
    return `grid-cols-${cols}`;
  };

  // Handle responsive columns
  const getResponsiveGridClasses = () => {
    if (typeof columns === 'object') {
      return [
        columns.base ? getGridColumns(columns.base) : 'grid-cols-1',
        columns.sm ? `sm:${getGridColumns(columns.sm)}` : '',
        columns.md ? `md:${getGridColumns(columns.md)}` : '',
        columns.lg ? `lg:${getGridColumns(columns.lg)}` : '',
        columns.xl ? `xl:${getGridColumns(columns.xl)}` : '',
        columns['2xl'] ? `2xl:${getGridColumns(columns['2xl'])}` : '',
      ].filter(Boolean).join(' ');
    } 
    
    return getGridColumns(columns as GridColumns);
  };

  // Auto-fill class
  const getAutoFillClass = () => {
    if (!autoFill) return '';
    return `grid-cols-[repeat(auto-fill,minmax(${minChildWidth || '200px'},1fr))]`;
  };

  // Auto rows class
  const autoRowsClass = autoRows ? 'grid-rows-[auto]' : '';

  // Container-responsive class
  const containerResponsiveClass = containerResponsive ? 'grid-cols-[repeat(auto-fit,minmax(0,1fr))]' : '';

  // Grid classes
  const gridClasses = [
    'grid',
    !autoFill && !containerResponsive ? getResponsiveGridClasses() : '',
    autoFill ? getAutoFillClass() : '',
    containerResponsive ? containerResponsiveClass : '',
    gapClass,
    justifyClasses[justify],
    alignClasses[align],
    autoRowsClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={gridClasses}>
      {children}
    </Component>
  );
};

export default Grid;
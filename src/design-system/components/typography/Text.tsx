import React, { ReactNode } from 'react';

export type TextSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
export type TextWeight = 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'normal';
export type TextColor = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'muted'
  | 'white'
  | 'black'
  | 'error';

export interface ResponsiveTextSize {
  base?: TextSize;
  sm?: TextSize;
  md?: TextSize;
  lg?: TextSize;
  xl?: TextSize;
}

export interface TextProps {
  /** The content to be displayed */
  children: ReactNode;
  /** Element to render as */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  /** Text size that can be responsive across breakpoints */
  size?: TextSize | ResponsiveTextSize;
  /** Font weight */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Text color variant */
  color?: TextColor;
  /** Whether the text should be truncated with an ellipsis */
  truncate?: boolean | number;
  /** Maximum number of lines before truncation */
  lineClamp?: number;
  /** Text transform */
  transform?: TextTransform;
  /** Whether text is italic */
  italic?: boolean;
  /** Whether text has underline */
  underline?: boolean;
  /** Whether text has line-through */
  lineThrough?: boolean;
  /** Whether text should be rendered with adaptive leading (line-height) */
  adaptiveLeading?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Alias for 'as' property - Semantic variant */
  variant?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  /** Alias for color="danger" */
  error?: boolean;
  /** Explicit line height */
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  /** Margin - shorthand for all margins */
  m?: number | string;
  /** Margin top */
  mt?: number | string;
  /** Margin bottom */
  mb?: number | string;
  /** Margin left */
  ml?: number | string;
  /** Margin right */
  mr?: number | string;
  /** Margin left & right */
  mx?: number | string;
  /** Margin top & bottom */
  my?: number | string;
  /** Padding - shorthand for all paddings */
  p?: number | string;
  /** Padding top */
  pt?: number | string;
  /** Padding bottom */
  pb?: number | string;
  /** Padding left */
  pl?: number | string;
  /** Padding right */
  pr?: number | string;
  /** Padding left & right */
  px?: number | string;
  /** Padding top & bottom */
  py?: number | string;
  /** Inline style object */
  style?: React.CSSProperties;
}

/**
 * Text - A component for displaying text with consistent typography styles,
 * responsive sizing, and advanced display options.
 */
export const Text: React.FC<TextProps> = ({
  children,
  as: Component = 'p',
  size = 'md',
  weight = 'normal',
  align,
  color = 'default',
  truncate = false,
  lineClamp,
  transform,
  italic = false,
  underline = false,
  lineThrough = false,
  adaptiveLeading = true,
  className = '',
  variant,
  error = false,
  lineHeight,
  m,
  mt,
  mb,
  ml,
  mr,
  mx,
  my,
  p,
  pt,
  pb,
  pl,
  pr,
  px,
  py,
  style,
}) => {
  // Use variant as a fallback for Component if provided
  const ElementType = variant || Component;
  
  // Use error prop to override color if true
  const effectiveColor = error ? 'danger' : color;
  
  // Size classes
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl',
    '8xl': 'text-8xl',
    '9xl': 'text-9xl',
  };

  // Get responsive size classes
  const getResponsiveSizeClasses = () => {
    if (typeof size === 'string') {
      return sizeClasses[size];
    }

    return [
      size.base ? sizeClasses[size.base] : 'text-base',
      size.sm ? `sm:${sizeClasses[size.sm]}` : '',
      size.md ? `md:${sizeClasses[size.md]}` : '',
      size.lg ? `lg:${sizeClasses[size.lg]}` : '',
      size.xl ? `xl:${sizeClasses[size.xl]}` : '',
    ].filter(Boolean).join(' ');
  };

  // Font weight classes
  const weightClasses = {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  };

  // Text alignment classes
  const alignClasses = align ? {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[align] : '';

  // Color classes
  const colorClasses = {
    default: 'text-gray-800 dark:text-gray-200',
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    muted: 'text-gray-500 dark:text-gray-500',
    white: 'text-white',
    black: 'text-black',
    error: 'text-red-600 dark:text-red-400', // Added error property with same styling as danger
  };

  // Text transform classes
  const transformClasses = transform ? {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    normal: 'normal-case',
  }[transform] : '';

  // Style classes
  const styleClasses = [
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    lineThrough ? 'line-through' : '',
  ].filter(Boolean).join(' ');

  // Truncation and line clamp classes
  const getTruncateClass = () => {
    if (truncate === true) {
      return 'truncate';
    }
    if (typeof truncate === 'number') {
      return `overflow-hidden text-ellipsis whitespace-nowrap max-w-[${truncate}ch]`;
    }
    return '';
  };

  const lineClampClass = lineClamp ? `line-clamp-${lineClamp}` : '';

  // Line height classes (override adaptive leading if specified)
  const lineHeightClass = lineHeight ? `leading-${lineHeight}` : '';

  // Adaptive leading (line-height) - only if no explicit lineHeight provided
  const getAdaptiveLeadingClass = () => {
    if (lineHeightClass || !adaptiveLeading) return '';

    const textSize = typeof size === 'string' ? size : size.base || 'md';
    
    // Apply appropriate line height based on text size
    if (['xs', 'sm', 'md'].includes(textSize)) {
      return 'leading-normal';
    } else if (['lg', 'xl', '2xl'].includes(textSize)) {
      return 'leading-relaxed';
    } else {
      return 'leading-tight';
    }
  };

  // Generate spacing classes
  const getSpacingClasses = () => {
    const spacingClasses = [];
    
    // Margin classes
    if (m !== undefined) spacingClasses.push(`m-${m}`);
    if (mt !== undefined) spacingClasses.push(`mt-${mt}`);
    if (mb !== undefined) spacingClasses.push(`mb-${mb}`);
    if (ml !== undefined) spacingClasses.push(`ml-${ml}`);
    if (mr !== undefined) spacingClasses.push(`mr-${mr}`);
    if (mx !== undefined) spacingClasses.push(`mx-${mx}`);
    if (my !== undefined) spacingClasses.push(`my-${my}`);
    
    // Padding classes
    if (p !== undefined) spacingClasses.push(`p-${p}`);
    if (pt !== undefined) spacingClasses.push(`pt-${pt}`);
    if (pb !== undefined) spacingClasses.push(`pb-${pb}`);
    if (pl !== undefined) spacingClasses.push(`pl-${pl}`);
    if (pr !== undefined) spacingClasses.push(`pr-${pr}`);
    if (px !== undefined) spacingClasses.push(`px-${px}`);
    if (py !== undefined) spacingClasses.push(`py-${py}`);
    
    return spacingClasses.join(' ');
  };

  // Combine all classes
  const textClasses = [
    getResponsiveSizeClasses(),
    weightClasses[weight],
    alignClasses,
    colorClasses[effectiveColor],
    transformClasses,
    styleClasses,
    getTruncateClass(),
    lineClampClass,
    lineHeightClass || getAdaptiveLeadingClass(),
    getSpacingClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <ElementType className={textClasses} style={style}>
      {children}
    </ElementType>
  );
};

export default Text;
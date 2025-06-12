import React from 'react';
import { TOOL_PANEL_CLASS } from '../foundations/layout';

// Basic component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// Example of a Button component
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  // Base styles
  let baseStyles = 'inline-flex items-center justify-center rounded font-medium';
  
  // Size styles
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    link: 'bg-transparent text-blue-600 hover:underline p-0',
  };
  
  const styles = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  ].join(' ');
  
  return (
    <button
      type="button"
      className={styles}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Example of a Card component
export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`${TOOL_PANEL_CLASS} ${className}`}>{children}</div>
);

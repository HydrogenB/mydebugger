import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  isElevated?: boolean;
  isInteractive?: boolean;
}

/**
 * Standardized card component for consistent UI containment
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  footer,
  isElevated = false,
  isInteractive = false
}) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
        transition-all duration-200
        ${isElevated ? 'shadow-sm' : ''}
        ${isInteractive ? 'hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      
      <div className="p-4">{children}</div>
      
      {footer && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
import React from 'react';

export interface CardProps {
  /** Card title */
  title?: React.ReactNode;
  /** Card subtitle */
  subtitle?: React.ReactNode;
  /** Card content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Whether to add extra padding */
  padded?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Custom CSS class */
  className?: string;
  /** ID attribute */
  id?: string;
  /** Card header actions (e.g. buttons) */
  actions?: React.ReactNode;
  /** Card hover effect */
  hoverable?: boolean;
  /** Whether the card is in a loading state */
  loading?: boolean;
  /** Optional image at the top of the card */
  image?: {
    src: string;
    alt?: string;
    className?: string;
    height?: string | number;
  };
  /** Optional click handler for the entire card */
  onClick?: () => void;
  /** Optional href to make the card a link */
  href?: string;
  /** Card color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

/**
 * Card component - Versatile container component for grouped content
 */
export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({
  title,
  subtitle,
  children,
  footer,
  padded = true,
  bordered = true,
  shadowed = true,
  className = '',
  id,
  actions,
  hoverable = false,
  loading = false,
  image,
  onClick,
  href,
  variant = 'default',
}) => {
  // Base card classes
  const cardClasses = [
    'bg-white dark:bg-gray-800 overflow-hidden flex flex-col h-full',
    bordered ? 'border border-gray-200 dark:border-gray-700' : '',
    shadowed ? 'shadow-sm' : '',
    hoverable ? 'transition-shadow duration-200 hover:shadow-md' : '',
    'rounded-lg',
    onClick || href ? 'cursor-pointer' : '',
    className,
  ];
  
  // Variant classes
  switch (variant) {
    case 'primary':
      cardClasses.push('bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800');
      break;
    case 'success':
      cardClasses.push('bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800');
      break;
    case 'warning':
      cardClasses.push('bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800');
      break;
    case 'danger':
      cardClasses.push('bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800');
      break;
    case 'info':
      cardClasses.push('bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800');
      break;
  }
  
  // Wrapper component (a or div)
  const WrapperComponent = href ? 'a' : 'div';
  
  // Event handlers
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
  };
  
  // Props for wrapper component
  const wrapperProps = {
    className: cardClasses.filter(Boolean).join(' '),
    id,
    ...(href ? { href } : {}),
    ...(onClick ? { onClick: handleClick } : {}),
  };
  
  return (
    <WrapperComponent {...wrapperProps}>
      {/* Card image */}
      {image && (
        <div className="w-full">
          <img
            src={image.src}
            alt={image.alt || ''}
            className={`w-full object-cover ${image.className || ''}`}
            style={{ height: image.height }}
          />
        </div>
      )}
      
      {/* Card header if title or actions exist */}
      {(title || actions) && (
        <div className="flex justify-between items-start p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      
      {/* Card body */}
      <div className={`flex-1 ${padded && !title ? 'p-4' : ''}`}>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {/* Card footer */}
      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {footer}
        </div>
      )}
    </WrapperComponent>
  );
};

/**
 * CardHeader - Component for the card header
 */
const CardHeader: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  divider?: boolean;
}> = ({ 
  title, 
  subtitle, 
  actions, 
  className = '',
  divider = true,
}) => {
  return (
    <div className={`flex justify-between items-start p-4 ${divider ? 'border-b border-gray-200 dark:border-gray-700' : ''} ${className}`}>
      <div>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

/**
 * CardBody - Component for the card content
 */
const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}> = ({ 
  children, 
  className = '',
  padded = true,
}) => {
  return (
    <div className={`${padded ? 'p-4' : ''} ${className}`}>
      {children}
    </div>
  );
};

/**
 * CardFooter - Component for the card footer
 */
const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
}> = ({
  children,
  className = '',
  divider = true,
  align = 'between',
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };
  
  return (
    <div className={`px-4 py-3 ${divider ? 'border-t border-gray-200 dark:border-gray-700' : ''} bg-gray-50 dark:bg-gray-900 flex items-center ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

// Attach subcomponents to Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
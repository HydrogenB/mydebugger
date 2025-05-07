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
  /** Whether the card has elevation (shadow) */
  isElevated?: boolean;
  /** Whether the card is interactive (has hover effects) */
  isInteractive?: boolean;
}

/**
 * Card - A flexible container for grouping and displaying content
 * 
 * @description
 * Cards are used to group and display content in a clear and concise format.
 * They can contain text, images, actions, and other UI components. Cards provide
 * a consistent way to present information across the application, with options
 * for headers, footers, and different visual styles.
 * 
 * Cards can be simple containers or interactive elements that link to detailed content.
 * They support various states including loading, hover effects, and color variants
 * to match different use cases and information priority levels.
 * 
 * @accessibility
 * - When used as interactive elements (with onClick or href), includes proper focus styles
 * - Maintains proper heading hierarchy when using titles
 * - Provides visual loading state with accessible indicators
 * - Ensures sufficient color contrast in all variants and modes
 * - Uses semantic HTML structure with appropriate ARIA attributes when needed
 * 
 * @example
 * ```tsx
 * // Basic card
 * <Card title="Card Title">
 *   <p>Card content goes here</p>
 * </Card>
 * 
 * // Card with all features
 * <Card
 *   title="Feature Overview"
 *   subtitle="Learn about our product features"
 *   actions={<Button variant="ghost" size="sm">View All</Button>}
 *   footer="Last updated: Yesterday"
 *   isElevated
 * >
 *   <p>Detailed description of features...</p>
 * </Card>
 * 
 * // Interactive card
 * <Card
 *   isInteractive
 *   onClick={() => navigateToDetail(item.id)}
 *   title={item.name}
 *   image={{ src: item.imageUrl, alt: item.name }}
 * >
 *   <p>{item.description}</p>
 * </Card>
 * ```
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
  isElevated = false,
  isInteractive = false,
}) => {
  // Base card classes
  const cardClasses = [
    'bg-white dark:bg-gray-800 overflow-hidden flex flex-col h-full',
    bordered ? 'border border-gray-200 dark:border-gray-700' : '',
    shadowed || isElevated ? 'shadow-sm' : '',
    (hoverable || isInteractive) ? 'transition-all duration-200 motion-reduce:transition-none hover:shadow-md' : '',
    'rounded-lg',
    (onClick || href || isInteractive) ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2' : '',
    isElevated ? 'shadow-md' : '',
    isInteractive ? 'transform hover:-translate-y-1 transition-transform duration-300 motion-reduce:transform-none' : '',
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
    ...(onClick || href ? { tabIndex: 0, role: 'button' } : {}),
  };
  
  return (
    <WrapperComponent {...wrapperProps}>
      {/* Card image */}
      {image && (
        <div className="w-full">
          <img
            src={image.src}
            alt={image.alt || ''}
            className={`w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${image.className || ''}`}
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
            <div className="animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite] rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
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
 * CardHeader - Component for the card header section
 * 
 * @description
 * A specialized component for creating consistent card headers
 * with optional title, subtitle, and action elements.
 * 
 * @example
 * ```tsx
 * <Card>
 *   <Card.Header 
 *     title="Analytics Overview" 
 *     subtitle="Past 30 days" 
 *     actions={<Button size="sm">Refresh</Button>}
 *   />
 *   <Card.Body>
 *     {content}
 *   </Card.Body>
 * </Card>
 * ```
 */
const CardHeader: React.FC<{
  /** Header title */
  title?: React.ReactNode;
  /** Header subtitle */
  subtitle?: React.ReactNode;
  /** Actions to display in the header (e.g. buttons) */
  actions?: React.ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Whether to show a divider below the header */
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
 * CardBody - Component for the main content area of a card
 * 
 * @description
 * Contains the primary content of a card with optional padding control.
 * 
 * @example
 * ```tsx
 * <Card>
 *   <Card.Header title="User Profile" />
 *   <Card.Body padded>
 *     <UserProfileContent />
 *   </Card.Body>
 * </Card>
 * ```
 */
const CardBody: React.FC<{
  /** Card body content */
  children: React.ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Whether to add padding around content */
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
 * CardFooter - Component for the card footer section
 * 
 * @description
 * A specialized component for creating consistent card footers
 * with options for content alignment and styling.
 * 
 * @example
 * ```tsx
 * <Card>
 *   <Card.Body>{content}</Card.Body>
 *   <Card.Footer align="between">
 *     <span>Created 2 days ago</span>
 *     <Button variant="primary">View Details</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
const CardFooter: React.FC<{
  /** Footer content */
  children: React.ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Whether to show a divider above the footer */
  divider?: boolean;
  /** Content alignment */
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
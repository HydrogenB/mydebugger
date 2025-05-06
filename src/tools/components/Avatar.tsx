import React, { useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the avatar image */
  alt?: string;
  /** Name to display when image is not available (will be shown as initials) */
  name?: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Whether the avatar is rounded (circle) or square */
  variant?: 'circle' | 'square' | 'rounded';
  /** Optional badge to show in the corner */
  badge?: React.ReactNode;
  /** Badge position */
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Outline color for the avatar */
  borderColor?: string;
  /** Optional custom CSS class */
  className?: string;
  /** Custom text color */
  textColor?: string;
  /** Custom background color for initials */
  bgColor?: string;
  /** Whether the avatar is part of a group */
  inGroup?: boolean;
}

/**
 * Avatar component for displaying user or profile images
 * Automatically falls back to initials when no image is available
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  variant = 'circle',
  badge,
  badgePosition = 'bottom-right',
  borderColor,
  className = '',
  textColor,
  bgColor,
  inGroup = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Size classes for the avatar
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  // Border radius based on variant
  const getRadiusClass = () => {
    switch (variant) {
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-none';
      case 'rounded': return 'rounded-lg';
      default: return 'rounded-full';
    }
  };

  // Calculate initials from name (up to 2 characters)
  const getInitials = () => {
    if (!name) return '';

    const nameParts = name.split(' ').filter(Boolean);
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate a simple deterministic color from name string
  const generateColor = (name: string) => {
    if (bgColor) return bgColor;
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-red-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];

    if (!name) return colors[0];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash + name.charCodeAt(i)) % colors.length;
    }
    
    return colors[hash];
  };

  // Handle image load error
  const handleError = () => {
    setImageError(true);
  };

  // Base classes
  const avatarClasses = [
    // Size
    sizeClasses[size],
    
    // Shape
    getRadiusClass(),
    
    // Border
    borderColor ? `border-2 ${borderColor}` : '',
    
    // Group positioning
    inGroup ? '-ml-2 ring-2 ring-white dark:ring-gray-800' : '',
    
    // Base styles
    'flex items-center justify-center relative overflow-hidden',
    
    // Custom class
    className,
  ].filter(Boolean).join(' ');

  // Badge positioning classes
  const badgePositionClasses = {
    'top-right': 'absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4',
    'top-left': 'absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/4',
    'bottom-right': 'absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4',
    'bottom-left': 'absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4',
  };

  return (
    <div className={avatarClasses}>
      {/* Image */}
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name}
          className={`w-full h-full object-cover ${getRadiusClass()}`}
          onError={handleError}
        />
      ) : (
        // Fallback to initials when no image is available
        <div
          className={`w-full h-full flex items-center justify-center ${generateColor(name)}`}
          aria-label={name || alt}
        >
          <span className={`font-medium ${textColor || 'text-white'}`}>
            {getInitials()}
          </span>
        </div>
      )}
      
      {/* Optional badge */}
      {badge && (
        <div className={badgePositionClasses[badgePosition]}>
          {badge}
        </div>
      )}
    </div>
  );
};

/**
 * Avatar Group - Displays multiple avatars in a stack
 */
export interface AvatarGroupProps {
  /** Avatar components to display in the group */
  children: React.ReactNode;
  /** Maximum number of avatars to show before showing a +X overflow */
  max?: number;
  /** Size for all avatars in the group */
  size?: AvatarSize;
  /** Custom CSS class */
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max,
  size = 'md',
  className = ''
}) => {
  const childrenArray = React.Children.toArray(children);
  const totalAvatars = childrenArray.length;
  const shouldLimit = max !== undefined && totalAvatars > max;
  const visibleAvatars = shouldLimit ? childrenArray.slice(0, max) : childrenArray;
  const remainingAvatars = shouldLimit ? totalAvatars - max : 0;
  
  // Get the same size classes as the Avatar component
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {visibleAvatars.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            key: index,
            size,
            inGroup: index > 0,
          });
        }
        return child;
      })}
      
      {remainingAvatars > 0 && (
        <div className={`
          ${sizeClasses[size]} 
          rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center 
          text-gray-800 dark:text-gray-200 font-medium -ml-2 ring-2 ring-white dark:ring-gray-800
        `}>
          +{remainingAvatars}
        </div>
      )}
    </div>
  );
};

export default Avatar;
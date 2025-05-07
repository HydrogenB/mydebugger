import React, { useState, ImgHTMLAttributes, useRef, useEffect } from 'react';

export type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
export type ImagePosition = 'center' | 'top' | 'right' | 'bottom' | 'left';
export type AspectRatio = '1:1' | '4:3' | '16:9' | '21:9' | '2:1' | '3:2' | null;

export interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  /** The URL of the image */
  src: string;
  /** Alternative text for the image */
  alt: string;
  /** How the image should be fitted within its container */
  objectFit?: ImageFit;
  /** How the image should be positioned within its container */
  objectPosition?: ImagePosition;
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** URL of a fallback image to use if the main image fails to load */
  fallbackSrc?: string;
  /** Whether to apply a blur-up effect while loading */
  blurUp?: boolean;
  /** Aspect ratio to maintain */
  aspectRatio?: AspectRatio;
  /** Whether to use native lazy loading when available */
  useNativeLoading?: boolean;
  /** Whether to fade in the image when it loads */
  fadeIn?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Whether to show a placeholder while loading */
  showPlaceholder?: boolean;
  /** Custom placeholder component */
  placeholder?: React.ReactNode;
  /** Callback function when image loads successfully */
  onLoad?: () => void;
  /** Callback function when image fails to load */
  onError?: () => void;
}

/**
 * ResponsiveImage - A component for displaying responsive images with advanced features
 * like aspect ratio control, lazy loading, and fallbacks.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  objectFit = 'cover',
  objectPosition = 'center',
  lazy = true,
  fallbackSrc,
  blurUp = true,
  aspectRatio = null,
  useNativeLoading = true,
  fadeIn = true,
  className = '',
  showPlaceholder = true,
  placeholder,
  onLoad: onLoadProp,
  onError: onErrorProp,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(!lazy);

  // Object fit classes
  const fitClasses = {
    fill: 'object-fill',
    contain: 'object-contain',
    cover: 'object-cover',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };

  // Object position classes
  const positionClasses = {
    center: 'object-center',
    top: 'object-top',
    right: 'object-right',
    bottom: 'object-bottom',
    left: 'object-left',
  };

  // Convert aspect ratio to percentage for padding-bottom trick
  const getAspectRatioPadding = () => {
    if (!aspectRatio) return null;
    
    const [width, height] = aspectRatio.split(':').map(Number);
    return (height / width) * 100;
  };

  const aspectRatioPadding = getAspectRatioPadding();

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading images when they're within 200px of the viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, isInView]);

  // Handle image load
  const handleImageLoad = () => {
    setLoaded(true);
    onLoadProp?.();
  };

  // Handle image error
  const handleImageError = () => {
    setError(true);
    onErrorProp?.();
  };

  // Render the actual image
  const renderImage = () => (
    <img
      ref={imgRef}
      src={error && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      loading={lazy && useNativeLoading ? 'lazy' : undefined}
      className={[
        fitClasses[objectFit],
        positionClasses[objectPosition],
        'w-full h-full',
        fadeIn && !loaded && !error ? 'opacity-0' : 'opacity-100',
        fadeIn ? 'transition-opacity duration-300' : '',
        className
      ].filter(Boolean).join(' ')}
      onLoad={handleImageLoad}
      onError={handleImageError}
      {...rest}
    />
  );

  // Render placeholder
  const renderPlaceholder = () => {
    if (placeholder) return placeholder;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
        <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  };

  // With aspect ratio
  if (aspectRatio) {
    return (
      <div className="relative w-full" style={{ paddingBottom: `${aspectRatioPadding}%` }}>
        <div className="absolute inset-0 overflow-hidden">
          {renderImage()}
          {showPlaceholder && (!isInView || (!loaded && !error)) && renderPlaceholder()}
        </div>
      </div>
    );
  }

  // No aspect ratio
  return (
    <div className="relative">
      {renderImage()}
      {showPlaceholder && (!isInView || (!loaded && !error)) && renderPlaceholder()}
    </div>
  );
};

export default ResponsiveImage;
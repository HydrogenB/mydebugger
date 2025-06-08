import React, { ReactNode, useEffect, useState } from 'react';

// Standard breakpoints aligned with Tailwind CSS
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export interface MediaQueryProps {
  /** Content to render if the query matches */
  children: ReactNode;
  /** Minimum screen width (inclusive) for the content to be shown */
  minWidth?: Breakpoint;
  /** Maximum screen width (inclusive) for the content to be shown */
  maxWidth?: Breakpoint;
  /** Only show content on the specified screen size range */
  screen?: Breakpoint;
  /** Only show content on screens larger than the specified breakpoint */
  largerThan?: Breakpoint;
  /** Only show content on screens smaller than the specified breakpoint */
  smallerThan?: Breakpoint;
  /** Render a placeholder when media query doesn't match */
  fallback?: ReactNode;
  /** Whether to use SSR-friendly behavior (default: true) */
  ssrSafe?: boolean;
}

/**
 * MediaQuery - A component for conditionally rendering content based on
 * screen size. Useful for different UI patterns across device sizes.
 */
export const MediaQuery: React.FC<MediaQueryProps> = ({
  children,
  minWidth,
  maxWidth,
  screen,
  largerThan,
  smallerThan,
  fallback = null,
  ssrSafe = true,
}) => {
  // Start with true on server for SSR, then update with actual value on client
  const [matches, setMatches] = useState(ssrSafe);

  // Compute the media query string based on the props
  const getMediaQuery = () => {
    const queries = [];

    // Direct screen size match
    if (screen) {
      // For screen="md", this creates a range between md and the next breakpoint (lg)
      const min = breakpointValues[screen];
      const sizes = Object.keys(breakpointValues) as Breakpoint[];
      const index = sizes.indexOf(screen);
      const max = index < sizes.length - 1 ? breakpointValues[sizes[index + 1]] - 1 : null;
      
      if (min) queries.push(`(min-width: ${min}px)`);
      if (max) queries.push(`(max-width: ${max}px)`);
      
      return queries.join(' and ');
    }

    // largerThan shorthand (min-width only)
    if (largerThan) {
      return `(min-width: ${breakpointValues[largerThan]}px)`;
    }

    // smallerThan shorthand (max-width only)
    if (smallerThan) {
      return `(max-width: ${breakpointValues[smallerThan] - 1}px)`;
    }

    // Explicit min/max ranges
    if (minWidth) {
      queries.push(`(min-width: ${breakpointValues[minWidth]}px)`);
    }

    if (maxWidth) {
      queries.push(`(max-width: ${breakpointValues[maxWidth]}px)`);
    }

    return queries.join(' and ');
  };

  useEffect(() => {
    const mediaQuery = getMediaQuery();
    
    // If no query is specified, always show content
    if (!mediaQuery) {
      setMatches(true);
      return;
    }
    
    // Create media query list and add listener
    const mediaQueryList = window.matchMedia(mediaQuery);
    
    // Initial check
    setMatches(mediaQueryList.matches);
    
    // Update state when media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener for modern browsers
    mediaQueryList.addEventListener('change', handleChange);
    
    // Cleanup
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [minWidth, maxWidth, screen, largerThan, smallerThan]);

  // Render content if media query matches
  return matches ? <>{children}</> : <>{fallback}</>;
};

/**
 * Hide - A utility component that hides content at specific breakpoints
 */
export interface HideProps {
  /** Content to conditionally hide */
  children: ReactNode;
  /** Hide on screens smaller than the specified breakpoint */
  below?: Breakpoint;
  /** Hide on screens larger than the specified breakpoint */
  above?: Breakpoint;
  /** Only hide on the specified screen size */
  on?: Breakpoint;
}

export const Hide: React.FC<HideProps> = ({
  children,
  below,
  above,
  on,
}) => {
  if (on) {
    // Invert the screen prop (show on all screens except this one)
    return (
      <MediaQuery screen={on} fallback={<>{children}</>}>
        {null}
      </MediaQuery>
    );
  }

  if (below) {
    return (
      <MediaQuery largerThan={below}>
        {children}
      </MediaQuery>
    );
  }

  if (above) {
    return (
      <MediaQuery smallerThan={above}>
        {children}
      </MediaQuery>
    );
  }

  return <>{children}</>;
};

/**
 * Show - A utility component that shows content only at specific breakpoints
 */
export interface ShowProps {
  /** Content to conditionally show */
  children: ReactNode;
  /** Only show on screens smaller than the specified breakpoint */
  below?: Breakpoint;
  /** Only show on screens larger than the specified breakpoint */
  above?: Breakpoint;
  /** Only show on the specified screen size */
  on?: Breakpoint;
}

export const Show: React.FC<ShowProps> = ({
  children,
  below,
  above,
  on,
}) => {
  if (on) {
    return (
      <MediaQuery screen={on}>
        {children}
      </MediaQuery>
    );
  }

  if (below) {
    return (
      <MediaQuery smallerThan={below}>
        {children}
      </MediaQuery>
    );
  }

  if (above) {
    return (
      <MediaQuery largerThan={above}>
        {children}
      </MediaQuery>
    );
  }

  return <>{children}</>;
};

// Export hooks for use in custom components
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    
    // Initial check
    setMatches(mediaQueryList.matches);
    
    // Update state when media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    mediaQueryList.addEventListener('change', handleChange);
    
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

// Convenience hooks for breakpoints
export const useBreakpoint = (breakpoint: Breakpoint, comparison: 'above' | 'below' = 'above'): boolean => {
  const value = breakpointValues[breakpoint];
  const query = comparison === 'above'
    ? `(min-width: ${value}px)`
    : `(max-width: ${value - 1}px)`;
    
  return useMediaQuery(query);
};

export default MediaQuery;
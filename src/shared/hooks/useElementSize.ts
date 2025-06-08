import { useState, useEffect, useCallback } from 'react'; // Added useCallback as it's good practice for setRef

/**
 * Custom hook to track element dimensions
 * Safely handles ResizeObserver errors
 */
export function useElementSize() {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    if (!ref) return;
    
    // Handle ResizeObserver errors
    const errorHandler = (e: ErrorEvent) => {
      if (e.message.includes('ResizeObserver')) {
        // Prevent the error from crashing the application
        e.preventDefault();
        e.stopPropagation();
        console.warn('ResizeObserver error caught:', e.message);
      }
    };
    
    // Add global error handler for ResizeObserver errors
    window.addEventListener('error', errorHandler);
    
    let observer: ResizeObserver | null = null;
    
    try {
      observer = new ResizeObserver(entries => {
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          setSize({ width, height });
        }
      });
      
      observer.observe(ref);
    } catch (error) {
      console.error('ResizeObserver not supported, falling back to getBoundingClientRect:', error);
      // Fallback for browsers without ResizeObserver support
      const { width, height } = ref.getBoundingClientRect();
      setSize({ width, height });
    }
    
    return () => {
      window.removeEventListener('error', errorHandler);
      observer?.disconnect();
    };
  }, [ref]);

  return [setRef, size] as const;
}

'use client';

import { useState, useEffect } from 'react';
import { ThemeMode } from '@/types';
import { isClient } from '@/utils';

/**
 * Custom hook for theme mode management
 * @returns Theme mode state and toggle function
 */
export function useThemeMode() {
  // Default to light mode
  const [mode, setMode] = useState<ThemeMode>('light');

  // On first render, check for stored theme preference
  useEffect(() => {
    if (!isClient) return;
    
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    
    if (storedMode) {
      setMode(storedMode);
    } else {
      // Check for system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, []);

  // Update local storage when mode changes
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Toggle between light and dark mode
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return { mode, toggleMode };
}

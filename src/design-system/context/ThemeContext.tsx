import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeType = 'light' | 'dark' | 'system';
type ColorScheme = 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'gray';

// Keep this interface compatible with the one in ../context/ThemeContext.tsx
export interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean; // Renamed from isDark for compatibility
  colorScheme: ColorScheme;
  setTheme: (theme: ThemeType) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeType;
  defaultColorScheme?: ColorScheme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  defaultColorScheme = 'blue',
  storageKey = 'ui-theme',
}) => {
  // Initialize state from localStorage or default values
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem(`${storageKey}-mode`);
    return (savedTheme as ThemeType) || defaultTheme;
  });
  
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const savedColorScheme = localStorage.getItem(`${storageKey}-color`);
    return (savedColorScheme as ColorScheme) || defaultColorScheme;
  });
    // Determine if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });  // Apply theme to document with enhanced handling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    // Update root element class with a smoother transition
    if (isDarkMode) {
      root.classList.add('dark');
      
      // Small delay to allow for CSS transitions
      setTimeout(() => {
        root.classList.remove('light');
      }, 10);
    } else {
      root.classList.add('light');
      
      // Small delay to allow for CSS transitions
      setTimeout(() => {
        root.classList.remove('dark');
      }, 10);
    }
    
    // Apply color scheme and store data attributes for enhanced styling
    root.setAttribute('data-color-scheme', colorScheme);
    root.setAttribute('data-theme', theme);
    
    // Store current theme and color scheme in localStorage with more robust error handling
    try {
      localStorage.setItem(`${storageKey}-mode`, theme);
      localStorage.setItem(`${storageKey}-color`, colorScheme);
    } catch (error) {
      console.warn('Failed to save theme preferences to localStorage:', error);
    }
    
    // Apply smooth transition to body
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }, [isDarkMode, colorScheme, theme, storageKey]);
  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  // Theme setter function
  const setTheme = (newTheme: ThemeType) => {
    localStorage.setItem(`${storageKey}-mode`, newTheme);
    setThemeState(newTheme);
    
    if (newTheme === 'system') {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDarkMode(newTheme === 'dark');
    }
  };

  // Color scheme setter function
  const setColorScheme = (newColorScheme: ColorScheme) => {
    localStorage.setItem(`${storageKey}-color`, newColorScheme);
    setColorSchemeState(newColorScheme);
  };
  // Toggle between light and dark modes
  const toggleTheme = () => {
    if (isDarkMode) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };
  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        colorScheme,
        setTheme,
        setColorScheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for consuming the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;
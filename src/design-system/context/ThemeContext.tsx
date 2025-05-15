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
  });
  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Update root element class
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Apply color scheme
    root.setAttribute('data-color-scheme', colorScheme);
  }, [isDarkMode, colorScheme]);
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
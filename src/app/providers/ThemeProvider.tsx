import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to safely access localStorage
const getStorageValue = (key: string, defaultValue: any) => {
  // Check if window is defined (browser environment)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    return saved !== null ? saved : defaultValue;
  }
  return defaultValue;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'system' 
}) => {
  // Use the safe helper function instead of direct localStorage access
  const [theme, setThemeState] = useState<Theme>(
    () => getStorageValue('theme', defaultTheme) as Theme
  );
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Handle system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setIsDarkMode(mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  // Set theme based on state
  useEffect(() => {
    // Skip this effect during SSR
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      systemTheme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
      setIsDarkMode(systemTheme === 'dark');
    } else {
      theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);
  
  const setTheme = (newTheme: Theme) => {
    // Safely set localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    setThemeState(newTheme);
  };
  
  const value = {
    theme,
    isDarkMode,
    setTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

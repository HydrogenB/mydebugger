import React from 'react';
import { ThemeContext, ThemeContextType } from '../context/ThemeContext';

interface MockThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
}

/**
 * A mock implementation of the ThemeProvider for testing components that use the theme context
 * This mock allows you to provide an initial theme and tracks theme toggles for assertions
 */
export const MockThemeProvider: React.FC<MockThemeProviderProps> = ({ 
  children, 
  initialTheme = 'light' 
}) => {
  const [theme, setTheme] = React.useState(initialTheme);
  const [isDarkMode, setIsDarkMode] = React.useState(initialTheme === 'dark');
  const [toggleCount, setToggleCount] = React.useState(0);

  // Handle theme changes
  React.useEffect(() => {
    if (theme === 'dark') {
      setIsDarkMode(true);
    } else if (theme === 'light') {
      setIsDarkMode(false);
    } else if (theme === 'system') {
      // For testing, assume system preference is light
      setIsDarkMode(false);
    }
  }, [theme]);

  const contextValue: ThemeContextType = {
    theme,
    isDarkMode,
    setTheme: (newTheme) => {
      setTheme(newTheme);
      setToggleCount(prev => prev + 1);
    }
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook for testing components that use the theme context
 */
export const useTestThemeContext = () => {
  const context = React.useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTestThemeContext must be used within a MockThemeProvider');
  }
  
  return context;
};
import React from 'react';
import { ThemeContext, ThemeContextType } from '../context/ThemeContext';

interface MockThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}

/**
 * A mock implementation of the ThemeProvider for testing components that use the theme context
 * This mock allows you to provide an initial theme and tracks theme toggles for assertions
 */
export const MockThemeProvider: React.FC<MockThemeProviderProps> = ({ 
  children, 
  initialTheme = 'light' 
}) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(initialTheme);
  const [toggleCount, setToggleCount] = React.useState(0);

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setToggleCount(prev => prev + 1);
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    // For testing purposes, expose the toggle count
    __testingProps: { toggleCount }
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
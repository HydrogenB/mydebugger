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
  // Initialize state with defaults, will be updated on client mount
  const [theme, setThemeState] = useState<ThemeType>(defaultTheme);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(defaultColorScheme);
  
  // Initial server-side/client-side default for isDarkMode. Client useEffect will refine this.
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (defaultTheme === 'dark') return true;
    if (defaultTheme === 'light') return false;
    // For 'system', we can't know on server, default to false. Client will update.
    return false; 
  });

  // Client-side effect to load preferences from localStorage and system settings
  useEffect(() => {
    const storedTheme = localStorage.getItem(`${storageKey}-mode`) as ThemeType | null;
    const initialUserTheme = storedTheme || defaultTheme;
    setThemeState(initialUserTheme); // Set the theme state based on storage or prop

    // Determine initial isDarkMode based on the resolved theme
    if (initialUserTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(systemPrefersDark);
    } else {
      setIsDarkMode(initialUserTheme === 'dark');
    }

    const storedColorScheme = localStorage.getItem(`${storageKey}-color`) as ColorScheme | null;
    if (storedColorScheme) {
      setColorSchemeState(storedColorScheme);
    }
    // else it remains defaultColorScheme from useState initializer
  }, [defaultTheme, storageKey]); // Runs once on mount client-side

  // Effect to apply theme changes to the DOM and update localStorage
  useEffect(() => {
    // This effect runs on client after hydration and on subsequent state changes
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark'); // Clear previous theme classes

    // Determine the effective theme for class setting based on current state
    let effectiveThemeIsDark = false;
    if (theme === 'dark') {
        effectiveThemeIsDark = true;
    } else if (theme === 'light') {
        effectiveThemeIsDark = false;
    } else { // theme === 'system'
        effectiveThemeIsDark = isDarkMode; // isDarkMode reflects system preference
    }

    if (effectiveThemeIsDark) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
    
    root.setAttribute('data-color-scheme', colorScheme);
    root.setAttribute('data-theme', theme); // Persist the selected theme ('light', 'dark', 'system')

    try {
      localStorage.setItem(`${storageKey}-mode`, theme);
      localStorage.setItem(`${storageKey}-color`, colorScheme);
    } catch (error) {
      console.warn('Failed to save theme preferences to localStorage:', error);
    }
    
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }, [theme, isDarkMode, colorScheme, storageKey]);

  // Effect to listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches); // Update isDarkMode when system preference changes
    };

    // Ensure isDarkMode is correctly set if theme is already 'system' on mount
    setIsDarkMode(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]); // Re-run if theme changes to/from 'system'

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme); 
    if (newTheme === 'system') {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDarkMode(newTheme === 'dark');
    }
  };

  const setColorScheme = (newColorScheme: ColorScheme) => {
    setColorSchemeState(newColorScheme);
  };

  const toggleTheme = () => {
    let currentVisualIsDark = theme === 'system' ? isDarkMode : theme === 'dark';
    setTheme(currentVisualIsDark ? 'light' : 'dark');
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
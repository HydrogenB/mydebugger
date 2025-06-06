'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { ReactNode, createContext, useContext, useEffect } from 'react';
import { useThemeMode } from '@/hooks';
import { ThemeMode } from '@/types';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const { mode, toggleMode } = useThemeMode();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', mode === 'dark');
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

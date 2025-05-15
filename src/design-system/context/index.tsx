import React, { ReactNode } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext.tsx';
import { ToastProvider, useToast } from './ToastContext.tsx';

// Create a combined provider for convenience
export const AppProviders: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
};

export {
  ThemeProvider,
  useTheme,
  ToastProvider,
  useToast
};

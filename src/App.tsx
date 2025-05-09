import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './design-system/context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './app/routes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
};

export default App;
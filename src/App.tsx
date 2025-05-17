import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// Comment out the HelmetProvider since we're not using it
// import { HelmetProvider } from 'react-helmet-async';
import './App.css';

import { ThemeProvider } from './app/providers/ThemeProvider';
import Header from './layout/Header';
import { AppRoutes } from './app/routes';
import Footer from './layout/Footer';

function App() {
  return (
    // Remove HelmetProvider
    // <HelmetProvider>
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
    // </HelmetProvider>
  );
}

export default App;
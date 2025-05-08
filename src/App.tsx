import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import toolRegistry from './tools';
import { ThemeProvider } from './design-system/context/ThemeContext';
import { LoadingSpinner } from './design-system/components/feedback';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter basename="/">
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          
          <main className="flex-grow">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Special handling for JWT tool with nested routes */}
                <Route path="/jwt/*" element={
                  <React.Suspense fallback={<LoadingSpinner />}>
                    {toolRegistry.find(tool => tool.id === 'jwt-toolkit')?.component && 
                      React.createElement(
                        toolRegistry.find(tool => tool.id === 'jwt-toolkit')!.component as React.ComponentType
                      )
                    }
                  </React.Suspense>
                } />
                
                {/* Dynamic routes for all other tools */}
                {toolRegistry
                  .filter(tool => tool.id !== 'jwt-toolkit') // Skip JWT as we handle it separately
                  .map((tool) => (
                    <Route
                      key={tool.route}
                      path={tool.route}
                      element={<tool.component />}
                    />
                  ))
                }
                
                {/* Catch-all route for 404s */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
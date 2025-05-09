import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import toolRegistry from './tools';
import { ThemeProvider } from './design-system/context/ThemeContext';
import { LoadingSpinner } from './design-system/components/feedback';

// Add global styling for tags
const tagStyles = `
  .tag-beta, .tag-new {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    line-height: 1;
  }
  
  .tag-beta {
    background-color: #FEF3C7;
    color: #92400E;
  }
  
  .dark .tag-beta {
    background-color: rgba(146, 64, 14, 0.3);
    color: #FBBF24;
  }
  
  .tag-new {
    background-color: #D1FAE5;
    color: #065F46;
  }
  
  .dark .tag-new {
    background-color: rgba(6, 95, 70, 0.3);
    color: #6EE7B7;
  }
`;

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter basename="/">
        {/* Add global tag styling */}
        <style>{tagStyles}</style>
        
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
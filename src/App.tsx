import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import toolRegistry from './tools';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingSpinner } from './design-system/components/feedback';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          
          <main className="flex-grow">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Dynamic routes for all tools */}
                {toolRegistry.map((tool) => (
                  <Route
                    key={tool.route}
                    path={tool.route}
                    element={<tool.component />}
                  />
                ))}
                
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
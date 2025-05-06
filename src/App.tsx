import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import toolRegistry from './tools';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-grow">
          <Suspense fallback={<div className="container mx-auto p-8 text-center">Loading...</div>}>
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
  );
};

export default App;
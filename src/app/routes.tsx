import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Home from '../pages/Home';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import toolRegistry from '../tools';
import { LoadingSpinner } from '../design-system/components/feedback';

// NotFound component
const NotFound = () => (
  <div className="container mx-auto p-8 text-center">
    <h1 className="text-3xl font-bold mb-6">404 - Page Not Found</h1>
    <p className="mb-4">
      The page you are looking for does not exist.
    </p>
    <Link to="/" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500">
      Return to Home
    </Link>
  </div>
);

// Simple MainLayout for wrapping pages
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    <div className="container mx-auto py-6 px-4">
      {children}
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
      <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />      {/* Dynamic routes for all tools */}      {toolRegistry.map((tool) => (
        <Route 
          key={tool.id} 
          path={`${tool.route}/*`} 
          element={
            <Suspense fallback={
              <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <tool.component />
            </Suspense>
          } 
        />
      ))}
      
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
};

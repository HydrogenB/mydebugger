import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Import LoadingSpinner from correct path
import { LoadingSpinner } from '../shared/design-system/components/feedback';
// Import from the pages directory
import NotFound from '../pages/NotFound';
import Home from '../pages/Home';
import { featureRegistry } from '@features/index';

/**
 * Application routes configuration
 * Automatically generates routes from feature registry
 */
export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="m-auto" />}>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />
        
        {/* Dynamic routes for all features */}
        {featureRegistry.map((feature) => (
          <Route
            key={feature.route}
            path={feature.route}
            element={
              <Suspense fallback={<LoadingSpinner size="lg" className="m-auto" />}>
                <feature.component />
              </Suspense>
            }
          />
        ))}
        
        {/* Catch-all route for 404s */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

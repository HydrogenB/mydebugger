import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { featureRegistry } from '@features/index';
import { LoadingSpinner } from '@shared/design-system';
import { NotFound, Home } from '@pages';

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

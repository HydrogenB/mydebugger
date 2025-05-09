import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';
import { featureRegistry } from '@features/index';
import { Spinner } from '../design-system';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        
        {/* Dynamically load routes from feature registry */}
        {featureRegistry.map((feature: any) => (
          <Route
            key={feature.id}
            path={feature.route}
            element={
              <Suspense fallback={<div className="p-8 flex justify-center"><Spinner /></div>}>
                {/* Feature component will be loaded dynamically */}
                <div>{feature.name} Content (Placeholder)</div>
              </Suspense>
            }
          />
        ))}
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

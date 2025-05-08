import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import JwtDecoder from './JwtDecoder';
import { BuilderWizard } from './components/BuilderWizard';
import { InspectorPane } from './components/InspectorPane';
import { JwksProbe } from './components/JwksProbe';
import { BenchResult } from './components/BenchResult';
import { JwtProvider } from './context/JwtContext';

/**
 * JWT Toolkit Routes Component
 * 
 * Defines the routes for the JWT toolkit:
 * - /jwt (default) - The main decoder interface
 * - /jwt/build - JWT Builder for creating tokens
 * - /jwt/inspect - Detailed token inspection and verification
 * - /jwt/jwks - JWKS analysis tool
 * - /jwt/benchmark - Performance benchmarking for algorithms
 */
export const JwtRoutes: React.FC = () => (
  <JwtProvider>
    <Routes>
      <Route path="/" element={<JwtDecoder />} />
      <Route path="/build" element={<BuilderWizard />} />
      <Route path="/inspect" element={<InspectorPane />} />
      <Route path="/jwks" element={<JwksProbe />} />
      <Route path="/benchmark" element={<BenchResult />} />
      {/* Redirect any other routes to the main JWT decoder */}
      <Route path="*" element={<Navigate to="/jwt" replace />} />
    </Routes>
  </JwtProvider>
);

export default JwtRoutes;
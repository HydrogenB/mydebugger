import React from 'react';
import JwtDecoder from './JwtDecoder';
import { BuilderWizard } from './components/BuilderWizard';
import { InspectorPane } from './components/InspectorPane';
import { JwksProbe } from './components/JwksProbe';
import { BenchResult } from './components/BenchResult';
import { JwtProvider } from './context/JwtContext';

/**
 * Note: This file is no longer used for routing.
 * JWT routing is now handled directly in JwtToolkit.tsx
 * using TabGroup/TabPanel components for simplicity and consistency
 * with other tools in the application.
 * 
 * This file is kept for reference only and could be safely deleted.
 */

export { JwtDecoder, BuilderWizard, InspectorPane, JwksProbe, BenchResult, JwtProvider };
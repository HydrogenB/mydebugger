/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCookieInspector from './hooks/useCookieInspector';
import CookieInspectorView from './components/CookieInspectorPanel';

const CookieInspectorPage: React.FC = () => {
  const vm = useCookieInspector();
  return <CookieInspectorView {...vm} />;
};

export default CookieInspectorPage;

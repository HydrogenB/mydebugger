/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCookieScope from './hooks/useCookieScope';
import CookieScopeView from './components/CookieScopePanel';

const CookieScopePage: React.FC = () => {
  const vm = useCookieScope();
  return <CookieScopeView {...vm} />;
};

export default CookieScopePage;

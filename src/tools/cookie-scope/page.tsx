/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCookieScope from '../../../viewmodel/useCookieScope';
import CookieScopeView from '../../../view/CookieScopeView';

const CookieScopePage: React.FC = () => {
  const vm = useCookieScope();
  return <CookieScopeView {...vm} />;
};

export default CookieScopePage;

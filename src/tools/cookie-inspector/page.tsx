/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCookieInspector from '../../../viewmodel/useCookieInspector';
import CookieInspectorView from '../../../view/CookieInspectorView';

const CookieInspectorPage: React.FC = () => {
  const vm = useCookieInspector();
  return <CookieInspectorView {...vm} />;
};

export default CookieInspectorPage;

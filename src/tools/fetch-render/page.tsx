/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useFetchRender from '../../../viewmodel/useFetchRender';
import FetchRenderView from '../../../view/FetchRenderView';

const FetchRenderPage: React.FC = () => {
  const vm = useFetchRender();
  return <FetchRenderView {...vm} />;
};

export default FetchRenderPage;

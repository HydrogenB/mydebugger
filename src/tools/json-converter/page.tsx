/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useJsonConverter from './hooks/useJsonConverter';
import JsonConverterView from './components/JsonConverterPanel';
import { getToolByRoute } from '../index';
import { ToolLayout } from '@design-system';

const JsonConverterPage: React.FC = () => {
  const vm = useJsonConverter();
  const tool = getToolByRoute('/json-converter');
  return (
    <ToolLayout
      tool={tool!}
      title="JSON to CSV / Excel Converter"
      description="Convert JSON data to CSV or Excel spreadsheets."
    >
      <JsonConverterView {...vm} />
    </ToolLayout>
  );
};

export default JsonConverterPage;

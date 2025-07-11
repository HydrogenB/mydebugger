/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useJsonConverter from '../../../viewmodel/useJsonConverter';
import JsonConverterView from '../../../view/JsonConverterView';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

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

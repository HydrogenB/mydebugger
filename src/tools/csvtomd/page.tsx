/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCsvtomd from '../../../viewmodel/useCsvtomd';
import CsvtomdView from '../../../view/CsvtomdView';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';

const CsvtomdPage: React.FC = () => {
  const vm = useCsvtomd();
  const tool = getToolByRoute('/csvtomd');

  return (
    <ToolLayout tool={tool!} title="CSV to Markdown" description="Convert CSV tables to GitHub-flavored Markdown.">
      <CsvtomdView {...vm} />
    </ToolLayout>
  );
};

export default CsvtomdPage;

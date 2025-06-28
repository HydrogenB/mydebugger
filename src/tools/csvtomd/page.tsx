/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useCsvtomd from '../../../viewmodel/useCsvtomd';
import CsvtomdView from '../../../view/CsvtomdView';

const CsvtomdPage: React.FC = () => {
  const vm = useCsvtomd();
  return <CsvtomdView {...vm} />;
};

export default CsvtomdPage;

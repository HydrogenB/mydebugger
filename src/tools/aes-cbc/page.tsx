/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useAesCbc from '../../../viewmodel/useAesCbc';
import AesCbcView from '../../../view/AesCbcView';

const AesCbcPage: React.FC = () => {
  const vm = useAesCbc();
  return (
    <AesCbcView
      keyValue={vm.key}
      input={vm.input}
      output={vm.output}
      mode={vm.mode}
      error={vm.error}
      examples={vm.examples}
      exampleIndex={vm.exampleIndex}
      setKey={vm.setKey}
      setInput={vm.setInput}
      setExampleIndex={vm.setExampleIndex}
      toggleMode={vm.toggleMode}
      clear={vm.clear}
    />
  );
};

export default AesCbcPage;

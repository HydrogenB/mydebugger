/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useAesCbc from './hooks/useAesCbc';
import AesCbcView from './components/AesCbcPanel';

const AesCbcPage: React.FC = () => {
  const vm = useAesCbc();
  return (
    <AesCbcView
      keyValue={vm.key}
      publicKey={vm.publicKey}
      privateKey={vm.privateKey}
      input={vm.input}
      output={vm.output}
      mode={vm.mode}
      algorithm={vm.algorithm}

      error={vm.error}
      examples={vm.examples}
      exampleIndex={vm.exampleIndex}
      setKey={vm.setKey}
      setPublicKey={vm.setPublicKey}
      setPrivateKey={vm.setPrivateKey}
      setInput={vm.setInput}
      setExampleIndex={vm.setExampleIndex}
      setAlgorithm={vm.setAlgorithm}
      generateKeyPair={vm.generateKeyPair}
      generateDemo={vm.generateDemo}
      saveCurrentKey={vm.saveCurrentKey}
      selectSavedKey={vm.selectSavedKey}
      discardSavedKey={vm.discardSavedKey}
      savedKeys={vm.savedKeys}
      savedKeyPairs={vm.savedKeyPairs}

      outputFormat={vm.outputFormat}
      setOutputFormat={vm.setOutputFormat}
      toastMessage={vm.toastMessage}
      copyOutput={vm.copyOutput}

      toggleMode={vm.toggleMode}
      clear={vm.clear}
    />
  );
};

export default AesCbcPage;

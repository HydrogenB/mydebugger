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

      toggleMode={vm.toggleMode}
      clear={vm.clear}
    />
  );
};

export default AesCbcPage;

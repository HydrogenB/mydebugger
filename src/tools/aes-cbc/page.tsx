/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Crypto Lab Page
 * Educational cryptography tool with transparent mechanics
 */

import React from 'react';
import useCryptoLab from './hooks/useCryptoLab';
import CryptoLabPanel from './components/CryptoLabPanel';
import type { CryptoAlgorithm } from './types';

const CryptoLabPage: React.FC = () => {
  const vm = useCryptoLab();

  return (
    <CryptoLabPanel
      // Mode & Algorithm
      mode={vm.mode}
      algorithm={vm.algorithm}
      onModeChange={vm.setMode}
      onAlgorithmChange={(algo) => vm.setAlgorithm(algo as CryptoAlgorithm)}

      // Input
      inputText={vm.inputText}
      inputBytes={vm.inputBytes}
      onInputChange={vm.setInputText}

      // Key Management (Symmetric)
      passphrase={vm.passphrase}
      showPassphrase={vm.showPassphrase}
      onPassphraseChange={vm.setPassphrase}
      onToggleShowPassphrase={vm.toggleShowPassphrase}

      // Key Management (Asymmetric)
      publicKey={vm.publicKey}
      privateKey={vm.privateKey}
      onPublicKeyChange={vm.setPublicKey}
      onPrivateKeyChange={vm.setPrivateKey}
      onGenerateKeyPair={vm.generateKeyPair}

      // Lab View
      labView={vm.labView}
      onToggleLabView={vm.toggleLabView}
      onSaltChange={vm.setSalt}
      onRegenerateSalt={vm.regenerateSalt}
      onIterationsChange={vm.setIterations}
      onIVChange={vm.setIV}
      onRegenerateIV={vm.regenerateIV}

      // Output
      output={vm.output}
      outputFormat={vm.outputFormat}
      onOutputFormatChange={vm.setOutputFormat}
      studyModeEnabled={vm.studyModeEnabled}
      onToggleStudyMode={vm.toggleStudyMode}
      outputAnatomy={vm.outputAnatomy}
      opensslCommand={vm.opensslCommand}
      hashResult={vm.hashResult}

      // Actions
      onExecute={vm.execute}
      onCopyOutput={vm.copyOutput}
      onCopyOpenSSLCommand={vm.copyOpenSSLCommand}
      onMoveToInput={vm.moveOutputToInput}
      onClear={vm.clear}
      onGenerateDemo={vm.generateDemo}

      // Status
      isProcessing={vm.isProcessing}
      error={vm.error}
      onClearError={vm.clearError}
      toastMessage={vm.toastMessage}

      // Flags
      isSymmetric={vm.isSymmetric}
      isAsymmetric={vm.isAsymmetric}
      isHashing={vm.isHashing}
    />
  );
};

export default CryptoLabPage;

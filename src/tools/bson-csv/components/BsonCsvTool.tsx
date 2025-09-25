/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useCallback } from "react";
import useBsonCsvTool from "../hooks/useBsonCsvTool";
import UploadZone from "./UploadZone";
import OptionsForm from "./OptionsForm";
import RunControls from "./RunControls";
import ProgressPanel from "./ProgressPanel";
import ResultPanel from "./ResultPanel";

const BsonCsvTool: React.FC = () => {
  const vm = useBsonCsvTool();

  const handleFileChange = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      await vm.onFileSelected(file);
    },
    [vm],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <UploadZone
            fileMeta={vm.fileMeta}
            status={vm.status}
            isWorkerReady={vm.isWorkerReady}
            onInputChange={handleFileChange}
            onClearFile={vm.onClearFile}
            onWarmup={vm.onWarmup}
            error={vm.error}
          />
          <RunControls
            status={vm.status}
            hasFile={vm.hasFile}
            isRunning={vm.isRunning}
            onStart={vm.onStart}
            onPause={vm.onPause}
            onResume={vm.onResume}
            onCancel={vm.onCancel}
            onConfirmSchema={vm.onConfirmSchema}
          />
        </div>
        <OptionsForm options={vm.options} updateOptions={vm.updateOptions} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProgressPanel
          status={vm.status}
          progress={vm.progress}
          logs={vm.logs}
          downloadLog={vm.downloadLog}
        />
        <ResultPanel
          status={vm.status}
          outputs={vm.outputs}
          schema={vm.schema}
          clearOutputs={vm.clearOutputs}
        />
      </section>
    </div>
  );
};

export default BsonCsvTool;

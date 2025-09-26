/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useCallback } from "react";
import useBsonCsvTool from "../hooks/useBsonCsvTool";
import UploadZone from "./UploadZone";
import RunControls from "./RunControls";
import ProgressPanel from "./ProgressPanel";
import ResultPanel from "./ResultPanel";
import OptionsForm from "./OptionsForm";

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
      <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <UploadZone
            fileMeta={vm.fileMeta}
            status={vm.status}
            onInputChange={handleFileChange}
            onClearFile={vm.onClearFile}
            error={vm.error}
          />
          <RunControls
            status={vm.status}
            hasFile={vm.hasFile}
            isRunning={vm.isRunning}
            onStart={vm.onStart}
            onCancel={vm.onCancel}
            onConfirmSchema={vm.onConfirmSchema}
          />
          <details className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-gray-100">
              Advanced settings
            </summary>
            <div className="mt-4">
              <OptionsForm options={vm.options} updateOptions={vm.updateOptions} />
            </div>
          </details>
        </div>
        <ProgressPanel
          status={vm.status}
          progress={vm.progress}
          logs={vm.logs}
          downloadLog={vm.downloadLog}
        />
      </section>

      <ResultPanel
        status={vm.status}
        outputs={vm.outputs}
        schema={vm.schema}
        clearOutputs={vm.clearOutputs}
      />
    </div>
  );
};

export default BsonCsvTool;

/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useMemo } from "react";
import { Button } from "../../../design-system/components/inputs";
import { TOOL_PANEL_CLASS } from "../../../design-system/foundations/layout";
import type { ConversionPhase } from "../types";

interface RunControlsProps {
  status: ConversionPhase;
  hasFile: boolean;
  isRunning: boolean;
  onStart: () => void;
  onCancel: () => void;
  onConfirmSchema: () => void;
}

const RunControls: React.FC<RunControlsProps> = ({
  status,
  hasFile,
  isRunning,
  onStart,
  onCancel,
  onConfirmSchema,
}) => {
  const canStart = useMemo(() => {
    return (
      hasFile &&
      (status === "idle" ||
        status === "cancelled" ||
        status === "completed" ||
        status === "failed")
    );
  }, [hasFile, status]);

  const canCancel = isRunning || status === "awaiting-schema";
  const canConfirm = status === "awaiting-schema";

  return (
    <div className={`${TOOL_PANEL_CLASS} flex flex-col gap-3`}>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onStart} disabled={!canStart}>
          Start conversion
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel} disabled={!canCancel}>
          Cancel run
        </Button>
        {canConfirm ? (
          <Button size="sm" variant="primary" onClick={onConfirmSchema}>
            Continue conversion
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Step 1: Upload your dump. Step 2: Start conversion. Step 3: Download CSV when it finishes.
      </p>
    </div>
  );
};

export default RunControls;

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
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onConfirmSchema: () => void;
}

const RunControls: React.FC<RunControlsProps> = ({
  status,
  hasFile,
  isRunning,
  onStart,
  onPause,
  onResume,
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

  const canPause = status === "discovery" || status === "conversion";
  const canResume = status === "paused";
  const canCancel = isRunning || status === "awaiting-schema" || status === "paused";
  const canConfirm = status === "awaiting-schema";

  return (
    <div className={`${TOOL_PANEL_CLASS} flex flex-col gap-3`}>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onStart} disabled={!canStart}>
          Start
        </Button>
        <Button size="sm" variant="secondary" onClick={onPause} disabled={!canPause}>
          Pause
        </Button>
        <Button size="sm" variant="secondary" onClick={onResume} disabled={!canResume}>
          Resume
        </Button>
        <Button size="sm" variant="danger" onClick={onCancel} disabled={!canCancel}>
          Cancel
        </Button>
        <Button size="sm" variant="secondary" onClick={onConfirmSchema} disabled={!canConfirm}>
          Confirm schema
        </Button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Tip: You can warm up the worker in the Uploader to reduce first-run latency.
      </div>
    </div>
  );
};

export default RunControls;

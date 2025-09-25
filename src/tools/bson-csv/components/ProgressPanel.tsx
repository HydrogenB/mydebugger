/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useMemo } from "react";
import { TOOL_PANEL_CLASS } from "../../../design-system/foundations/layout";
import type { ConversionPhase, LogEntry, ProgressPayload } from "../types";

interface ProgressPanelProps {
  status: ConversionPhase;
  progress: ProgressPayload | null;
  logs: LogEntry[];
  downloadLog: () => void;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ status, progress, logs, downloadLog }) => {
  const phaseLabel = useMemo(() => {
    switch (status) {
      case "discovery":
        return "Discovery Pass";
      case "awaiting-schema":
        return "Awaiting Schema";
      case "conversion":
        return "Conversion Pass";
      case "paused":
        return "Paused";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return "Idle";
    }
  }, [status]);

  return (
    <div className={`${TOOL_PANEL_CLASS} space-y-4`} aria-live="polite">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Progress</h3>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Phase: {phaseLabel}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Bytes read" value={progress ? formatBytes(progress.bytesRead) : "-"} />
        <Stat label="Rows parsed" value={progress ? String(progress.rowsParsed) : "-"} />
        <Stat label="Rows written" value={progress ? String(progress.rowsWritten) : "-"} />
        <Stat label="Columns" value={progress ? String(progress.colsDiscovered) : "-"} />
        <Stat label="Errors" value={progress ? String(progress.errors) : "-"} />
        <Stat
          label="Throughput"
          value={
            progress
              ? `${Math.round(progress.rateRowsPerSec)} r/s · ${progress.rateMBPerSec.toFixed(1)} MB/s`
              : "-"
          }
        />
        <Stat label="ETA" value={progress && progress.etaSeconds != null ? formatEta(progress.etaSeconds) : "-"} />
        <Stat label="Elapsed" value={progress ? formatEta(progress.elapsedMs / 1000) : "-"} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Logs</h4>
          <button
            type="button"
            className="text-xs text-primary-600 hover:underline"
            onClick={downloadLog}
            disabled={!logs.length}
          >
            Download log
          </button>
        </div>
        <div className="mt-2 max-h-48 overflow-auto rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {logs.length ? (
              logs.map((entry, idx) => (
                <li key={idx} className="px-3 py-2">
                  <span
                    className={
                      entry.level === "error"
                        ? "text-red-600 dark:text-red-400"
                        : entry.level === "warn"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-gray-700 dark:text-gray-300"
                    }
                  >
                    {entry.level.toUpperCase()}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400"> · </span>
                  <span className="text-gray-700 dark:text-gray-200">{entry.message}</span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400">No log messages yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2">
    <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</div>
  </div>
);

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const e = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const v = n / 1024 ** e;
  return `${v.toFixed(e === 0 ? 0 : v >= 10 ? 1 : 2)} ${units[e]}`;
}

function formatEta(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "-";
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h) return `${h}h ${m}m ${r}s`;
  if (m) return `${m}m ${r}s`;
  return `${r}s`;
}

export default ProgressPanel;

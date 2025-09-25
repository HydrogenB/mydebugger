/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import { TOOL_PANEL_CLASS } from "../../../design-system/foundations/layout";
import type { ConversionPhase, OutputPart, SchemaPayload } from "../types";

interface ResultPanelProps {
  status: ConversionPhase;
  outputs: OutputPart[];
  schema: SchemaPayload | null;
  clearOutputs: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ status, outputs, schema, clearOutputs }) => {
  const hasOutputs = outputs.length > 0;

  return (
    <div className={`${TOOL_PANEL_CLASS} space-y-4`}>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Results</h3>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
          {status === "completed"
            ? "Conversion completed. Download your files below."
            : hasOutputs
            ? "Partial outputs available. You can download completed parts."
            : "No outputs yet."}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Downloads</h4>
        {hasOutputs ? (
          <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-800 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm">
            {outputs.map((o) => (
              <li key={o.href} className="flex items-center justify-between px-3 py-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{o.filename}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatBytes(o.sizeBytes)} · {o.rows} rows · {o.mimeType}
                  </div>
                </div>
                <a
                  href={o.href}
                  download={o.filename}
                  className="text-primary-600 hover:underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">No files yet.</div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Schema Summary</h4>
          {hasOutputs ? (
            <button
              type="button"
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
              onClick={clearOutputs}
            >
              Clear outputs
            </button>
          ) : null}
        </div>
        {schema ? (
          <div className="mt-2 max-h-48 overflow-auto rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {schema.columns.map((col) => (
                <li key={col} className="px-3 py-2 text-gray-800 dark:text-gray-200">
                  {col}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">No schema yet.</div>
        )}
      </div>
    </div>
  );
};

function formatBytes(size: number): string {
  if (size === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const e = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const v = size / 1024 ** e;
  return `${v.toFixed(e === 0 ? 0 : v >= 10 ? 1 : 2)} ${units[e]}`;
}

export default ResultPanel;

/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import { DynamicLinkTrace } from "../src/tools/dynamic-link-probe/lib/dynamicLink";

interface Props {
  trace: DynamicLinkTrace;
}

export function DynamicLinkProbeOverlay({ trace }: Props) {
  return (
    <div className="fixed top-2 left-2 bg-black text-white text-xs p-2 rounded z-[9999]">
      <div>
        <strong>URL:</strong> {trace.sourceUrl}
      </div>
      <div>
        <strong>Params:</strong> {JSON.stringify(trace.params)}
      </div>
      <div>
        <strong>Page:</strong> {window.location.pathname}
      </div>
    </div>
  );
}

export default DynamicLinkProbeOverlay;

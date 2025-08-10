/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import { useDynamicLinkProbe } from '../hooks/useDynamicLinkProbe';
import { DynamicLinkProbeOverlay } from "./DynamicLinkProbeOverlay";

export function DynamicLinkProbeProvider() {
  const { trace } = useDynamicLinkProbe();

  if (typeof window === "undefined") return null;
  const show =
    window.location.search.includes("debug=true") ||
    process.env.NODE_ENV === "development";

  if (!show || !trace) return null;

  return <DynamicLinkProbeOverlay trace={trace} />;
}

export default DynamicLinkProbeProvider;

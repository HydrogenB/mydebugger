/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import DynamicLinkProbeProvider from './components/DynamicLinkProbeProviderPanel';

const DynamicLinkProbePage: React.FC = () => (
  <div className="p-4 space-y-4">
    <h1 className="text-xl font-bold">Dynamic-Link Probe</h1>
    <p>
      Open this page with query parameters to trace them. Add{" "}
      <code>?debug=true</code> to show the overlay.
    </p>
    <DynamicLinkProbeProvider />
  </div>
);

export default DynamicLinkProbePage;

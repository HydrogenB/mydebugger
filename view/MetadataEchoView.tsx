/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import type { UseMetadataEchoReturn } from "../viewmodel/useMetadataEcho";
import { TOOL_PANEL_CLASS } from "../src/design-system/foundations/layout";

const row = (label: string, value: React.ReactNode) => (
  <tr className="border-t last:border-b">
    <th className="text-left py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
      {label}
    </th>
    <td className="py-2 break-all text-gray-900 dark:text-gray-100">{value}</td>
  </tr>
);

function MetadataEchoView({
  basic,
  advanced,
  loading,
  loadAdvanced,
}: UseMetadataEchoReturn) {
  if (!basic) return null;
  return (
    <div className="space-y-6">
      <div className={TOOL_PANEL_CLASS}>
        <h2 className="text-2xl font-bold mb-4">Client Metadata</h2>
        <table className="w-full text-sm">
          <tbody>
            {row("User Agent", basic.userAgent)}
            {row("Platform", basic.platform)}
            {row("Language", basic.language)}
            {row("Languages", basic.languages.join(", "))}
            {row("Screen Resolution", basic.screenResolution)}
            {row("Device Pixel Ratio", basic.devicePixelRatio)}
            {row("Timezone Offset", basic.timezoneOffset)}
            {row("Timezone", basic.timezone)}
            {row("Cookies Enabled", String(basic.cookiesEnabled))}
            {row("Touch Support", String(basic.touchSupport))}
            {row("Referrer", basic.referrer || "N/A")}
            {row("Page URL", basic.pageUrl)}
            {advanced?.connectionType &&
              row("Connection", advanced.connectionType)}
            {advanced?.downlink && row("Downlink", `${advanced.downlink} Mbps`)}
            {advanced?.battery &&
              row(
                "Battery",
                `${Math.round(advanced.battery.level * 100)}% ${advanced.battery.charging ? "charging" : "discharging"}`,
              )}
            {advanced?.geo &&
              row(
                "Location",
                `${advanced.geo.latitude.toFixed(4)}, ${advanced.geo.longitude.toFixed(4)} ±${advanced.geo.accuracy}m`,
              )}
            {advanced?.gpu && row("GPU", advanced.gpu)}
          </tbody>
        </table>
        {!advanced && (
          <div className="text-right mt-4">
            <button
              type="button"
              onClick={loadAdvanced}
              disabled={loading}
              className="px-3 py-1 rounded-md text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load Advanced Metadata"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MetadataEchoView;

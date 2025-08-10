/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import type { UseMetadataEchoReturn } from '../hooks/useMetadataEcho';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';

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
            {advanced &&
              row(
                "Connection",
                advanced.connectionType ?? advanced.errors.connection ?? "N/A",
              )}
            {advanced &&
              row(
                "Downlink",
                advanced.downlink !== undefined
                  ? `${advanced.downlink} Mbps`
                  : advanced.errors.connection ?? "N/A",
              )}
            {advanced &&
              row(
                "Battery",
                advanced.battery
                  ? `${Math.round(advanced.battery.level * 100)}% ${advanced.battery.charging ? "charging" : "discharging"}`
                  : advanced.errors.battery ?? "N/A",
              )}
            {advanced &&
              row(
                "Location",
                advanced.geo
                  ? `${advanced.geo.latitude.toFixed(4)}, ${advanced.geo.longitude.toFixed(4)} ±${advanced.geo.accuracy}m`
                  : advanced.errors.geo ?? "N/A",
              )}
            {advanced && row("GPU", advanced.gpu ?? advanced.errors.gpu ?? "N/A")}
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

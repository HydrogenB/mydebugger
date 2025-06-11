/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface ClickjackingReport {
  url: string;
  headers: Record<string, string>;
  protected: boolean;
  message?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: string;
}

export const formatReportFilename = (
  host: string,
  date: Date = new Date(),
): string => {
  const safeHost = host.replace(/[^a-z0-9.-]/gi, '') || 'site';
  const ts = date.toISOString().replace(/[:T]/g, '-').split('.')[0];
  return `${safeHost}_clickjacking_${ts}.json`;
};

export const generateReport = (data: ClickjackingReport): string =>
  JSON.stringify(data, null, 2);

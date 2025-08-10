export function formatExportFilename(hostname: string): string {
  const safeHost = hostname.replace(/[^a-zA-Z0-9.-]/g, '-');
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `cookies-${safeHost}-${date}.json`;
}




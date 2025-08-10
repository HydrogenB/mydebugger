/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface ParsedCurl {
  url: string;
  origin: string;
}

export const parseCurl = (curlText: string): ParsedCurl => {
  const urlMatch = curlText.match(/curl\s+'(wss?:\/\/[^']+)'/);
  const originMatch = curlText.match(/-H\s+'Origin:\s+([^']+)'/);
  return {
    url: urlMatch?.[1] ?? '',
    origin: originMatch?.[1] ?? '',
  };
};

export const textToHex = (text: string): string =>
  Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');

export const hexToText = (hex: string): string => {
  const clean = hex.replace(/\s+/g, '');
  const bytes = new Uint8Array(
    clean.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );
  return new TextDecoder().decode(bytes);
};

export const exportLogs = (logs: string[]): void => {
  const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ws_log_${new Date().toISOString()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

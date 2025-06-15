/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface ContactInfo {
  fullName: string;
  phone?: string;
  email?: string;
}

export const generateVCard = (info: ContactInfo): string => {
  if (!info.fullName) throw new Error('fullName is required');
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${info.fullName}`,
  ];
  if (info.phone) lines.push(`TEL;TYPE=CELL:${info.phone}`);
  if (info.email) lines.push(`EMAIL:${info.email}`);
  lines.push('END:VCARD');
  return lines.join('\n');
};

export const encodeContactData = (info: ContactInfo): string => {
  const json = JSON.stringify(info);
  return typeof btoa === 'function'
    ? btoa(json)
    : Buffer.from(json, 'utf-8').toString('base64');
};

export const decodeContactData = (encoded: string): ContactInfo | null => {
  try {
    const json = typeof atob === 'function'
      ? atob(encoded)
      : Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(json) as ContactInfo;
  } catch {
    return null;
  }
};

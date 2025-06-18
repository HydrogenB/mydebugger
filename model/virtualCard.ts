/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface ContactInfo {
  fullName: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  website?: string;
  address?: string;
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
  if (info.organization) lines.push(`ORG:${info.organization}`);
  if (info.title) lines.push(`TITLE:${info.title}`);
  if (info.website) lines.push(`URL:${info.website}`);
  if (info.address) lines.push(`ADR:${info.address}`);
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

export const getInitials = (fullName: string): string => {
  if (!fullName) return '';
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

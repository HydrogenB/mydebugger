/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface Metadata {
  title: string | null;
  description: string | null;
  h1: string | null;
}

export const parseMetadata = (html: string): Metadata => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const title = doc.querySelector('title')?.textContent ?? null;
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? null;
  const h1 = doc.querySelector('h1')?.textContent?.trim() ?? null;
  return { title, description, h1 };
};

export interface Snapshot extends Metadata {
  userAgent: string;
  status: number;
  html: string;
}

export const fetchSnapshot = async (url: string, userAgent: string): Promise<Snapshot> => {
  const res = await fetch(`/api/utility-tools?tool=proxy&url=${encodeURIComponent(url)}&ua=${encodeURIComponent(userAgent)}`);
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  const meta = parseMetadata(data.html);
  return { userAgent, status: data.status, html: data.html, ...meta };
};

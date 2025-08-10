/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { parseCookieString } from '../../cookie-inspector/lib/cookies';

interface CookieStoreItem {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  sameSite?: string;
  secure?: boolean;
}

export interface ParsedCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  sameSite?: string;
  secure: boolean;
  httpOnly: boolean;
  accessible: boolean;
}

export const parseCookies = async (): Promise<ParsedCookie[]> => {
  if (typeof document === 'undefined' || !navigator.cookieEnabled) {
    return [];
  }

  if (typeof window !== 'undefined' && (window as unknown as { cookieStore?: { getAll: () => Promise<CookieStoreItem[]> } }).cookieStore?.getAll) {
    try {
      const list: CookieStoreItem[] = await (window as unknown as { cookieStore: { getAll: () => Promise<CookieStoreItem[]> } }).cookieStore.getAll();
      return list.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        sameSite: c.sameSite,
        secure: !!c.secure,
        httpOnly: false,
        accessible: true,
      }));
    } catch {
      // fall through to document.cookie parsing
    }
  }

  const fromDoc = parseCookieString(document.cookie);
  return fromDoc.map((c) => ({
    name: c.name,
    value: c.value,
    secure: window.location.protocol === 'https:',
    httpOnly: false,
    accessible: true,
  }));
};

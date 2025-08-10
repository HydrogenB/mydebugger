/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface BasicCookie {
  name: string;
  value: string;
}

export interface ClientCookie extends BasicCookie {
  domain?: string;
  path?: string;
  expires?: number;
  secure?: boolean;
  sameSite?: string;
}

export interface CookieInfo extends ClientCookie {
  size: number;
  httpOnly: boolean;
  accessible: boolean;
}

export const parseCookieString = (cookieString: string): BasicCookie[] =>
  !cookieString
    ? []
    : cookieString.split(';').map((part) => {
        const [name, ...rest] = part.trim().split('=');
        return { name, value: rest.join('=') };
      });

export const mergeCookies = (
  serverCookies: BasicCookie[],
  clientCookies: ClientCookie[],
): CookieInfo[] =>
  serverCookies.map((sc) => {
    const client = clientCookies.find((cc) => cc.name === sc.name);
    const base = client ?? { name: sc.name, value: sc.value };
    return {
      ...base,
      value: client ? client.value : sc.value,
      size: base.name.length + base.value.length,
      httpOnly: !client,
      accessible: !!client,
    };
  });

export const formatExportFilename = (
  host: string,
  date: Date = new Date(),
): string => {
  const safeHost = (host || 'site').replace(/[^a-zA-Z0-9.-]/g, '-');
  const ts = date.toISOString().replace(/[:T]/g, '-').split('.')[0];
  return `${safeHost}_${ts}.json`;
};

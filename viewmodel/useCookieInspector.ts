/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from 'react';
import {
  BasicCookie,
  ClientCookie,
  CookieInfo,
  parseCookieString,
  mergeCookies,
  formatExportFilename,
} from '../model/cookies';

interface StoreCookie extends ClientCookie {}

declare global {
  interface Window {
    cookieStore?: {
      getAll: () => Promise<StoreCookie[]>;
    };
  }
}

const fetchServerCookies = async (): Promise<BasicCookie[]> => {
  try {
    const res = await fetch('/api/cookies');
    if (!res.ok) throw new Error('Failed to fetch cookies');
    const data = await res.json();
    return Array.isArray(data.cookies) ? data.cookies : [];
  } catch {
    return [];
  }
};

const getClientCookies = async (): Promise<ClientCookie[]> => {
  if (window.cookieStore && window.cookieStore.getAll) {
    const cs = await window.cookieStore.getAll();
    return cs.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires,
      secure: c.secure,
      sameSite: c.sameSite,
    }));
  }
  return parseCookieString(document.cookie).map((c) => ({ ...c }));
};

export const useCookieInspector = () => {
  const [cookies, setCookies] = useState<CookieInfo[]>([]);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    (async () => {
      const [server, client] = await Promise.all([
        fetchServerCookies(),
        getClientCookies(),
      ]);
      setCookies(mergeCookies(server, client));
    })();
  }, []);

  const filtered = cookies.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()));

  const toggleExpand = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const copy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setToastMessage(`${label} copied!`);
    } catch {
      setToastMessage('Clipboard access denied');
    }
  };

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }
    const timer = setTimeout(() => setToastMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(window.location.hostname);
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    cookies: filtered,
    filter,
    setFilter,
    exportJson,
    expanded,
    toggleExpand,
    copy,
    toastMessage,
  };
};

export default useCookieInspector;

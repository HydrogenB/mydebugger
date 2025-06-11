/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from 'react';
import { ParsedCookie, parseCookies } from '../model/cookieScope';
import { formatExportFilename } from '../model/cookies';

export const useCookieScope = () => {
  const [cookies, setCookies] = useState<ParsedCookie[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showHttpOnly, setShowHttpOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    (async () => {
      const data = await parseCookies();
      setCookies(data);
    })();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setFilter(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const filtered = cookies.filter((c) => {
    if (!showHttpOnly && c.httpOnly) return false;
    return (
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.value.toLowerCase().includes(filter.toLowerCase())
    );
  });

  const duplicates = new Set<string>();
  const conflicts = new Set<string>();
  const sameSiteMismatch = new Set<string>();
  const map = new Map<string, ParsedCookie[]>();
  cookies.forEach((c) => {
    const arr = map.get(c.name) || [];
    arr.push(c);
    map.set(c.name, arr);
  });
  map.forEach((arr, name) => {
    if (arr.length > 1) {
      duplicates.add(name);
      const domainPaths = new Set(arr.map((x) => `${x.domain ?? ''}|${x.path ?? ''}`));
      if (domainPaths.size > 1) conflicts.add(name);
      const sameSiteSecure = new Set(arr.map((x) => `${x.sameSite ?? ''}|${x.secure}`));
      if (sameSiteSecure.size > 1) sameSiteMismatch.add(name);
    }
  });

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

  const exportHar = () => {
    const har = {
      log: {
        version: '1.2',
        creator: { name: 'Cookie Scope', version: '1.0' },
        entries: [
          {
            startedDateTime: new Date().toISOString(),
            time: 0,
            request: {
              method: 'GET',
              url: window.location.href,
              httpVersion: 'HTTP/1.1',
              cookies: filtered,
              headers: [],
              queryString: [],
              headersSize: -1,
              bodySize: -1,
            },
            response: {
              status: 0,
              statusText: '',
              httpVersion: 'HTTP/1.1',
              cookies: filtered,
              headers: [],
              content: { size: 0, mimeType: '', text: '' },
              redirectURL: '',
              headersSize: -1,
              bodySize: -1,
            },
            cache: {},
            timings: { send: 0, wait: 0, receive: 0 },
          },
        ],
      },
    };
    const blob = new Blob([JSON.stringify(har, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formatExportFilename(window.location.hostname).replace('.json', '.har');
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage('Copied!');
    } catch {
      setToastMessage('Clipboard access denied');
    }
  };

  useEffect(() => {
    if (!toastMessage) return undefined;
    const t = setTimeout(() => setToastMessage(''), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  return {
    cookies: filtered,
    search,
    setSearch,
    showHttpOnly,
    setShowHttpOnly,
    duplicates,
    conflicts,
    sameSiteMismatch,
    exportJson,
    exportHar,
    copy,
    toastMessage,
  };
};

export default useCookieScope;

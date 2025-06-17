/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useRef, useState } from 'react';
import { fetchSnapshot } from '../model/prerender';

export const useFetchRender = () => {
  const [url, setUrl] = useState('');
  const [delay, setDelay] = useState(2); // seconds
  const [rawHtml, setRawHtml] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const run = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setRenderedHtml('');
    setLogs([]);
    try {
      const snap = await fetchSnapshot(url, 'MyDebugger-FetchRender/1.0');
      setRawHtml(snap.html);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rawHtml) return undefined;
    const frame = iframeRef.current;
    if (!frame) return undefined;

    const handler = (ev: MessageEvent) => {
      if (ev.source === frame.contentWindow && ev.data?.type === 'log') {
        setLogs(l => [...l, ev.data.message]);
      }
    };
    window.addEventListener('message', handler);

    const timer = window.setTimeout(() => {
      try {
        const doc = frame.contentDocument;
        if (doc) setRenderedHtml(doc.documentElement.outerHTML);
      } catch {
        // ignore cross origin
      }
    }, delay * 1000);

    return () => {
      window.removeEventListener('message', handler);
      window.clearTimeout(timer);
    };
  }, [rawHtml, delay]);

  const srcDoc = rawHtml
    ? rawHtml.replace(
        // eslint-disable-next-line no-useless-escape
        /<\/body>/i,
        `<script>(function(){['log','warn','error'].forEach(t=>{const o=console[t];console[t]=function(...a){parent.postMessage({type:'log',message:t+': '+a.join(' ')},'*');o.apply(console,a);};});window.onerror=function(m,s,l,c,e){parent.postMessage({type:'log',message:'error: '+m},'*');};})();</script></body>`
      )
    : undefined;

  const copyHtml = async () => {
    if (!renderedHtml) return;
    try {
      await navigator.clipboard.writeText(renderedHtml);
    } catch {
      // ignore clipboard errors
    }
  };

  const exportHtml = () => {
    if (!renderedHtml) return;
    const blob = new Blob([renderedHtml], { type: 'text/html' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'rendered.html';
    a.click();
    URL.revokeObjectURL(href);
  };

  return {
    url,
    setUrl,
    delay,
    setDelay,
    run,
    loading,
    error,
    iframeRef,
    srcDoc,
    rawHtml,
    renderedHtml,
    logs,
    copyHtml,
    exportHtml,
  };
};

export default useFetchRender;

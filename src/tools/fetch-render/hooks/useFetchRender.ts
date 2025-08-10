/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useRef, useState } from 'react';
import { fetchSnapshot, parseMetadata, Metadata } from '../lib/prerender';
import { AGENTS } from './usePreRenderingTester';

export type ExportFormat = 'html' | 'json';

export const useFetchRender = () => {
  const [url, setUrl] = useState('');
  const [delay, setDelay] = useState(2); // seconds
  const [userAgent, setUserAgent] = useState(AGENTS[3].id); // Desktop Chrome default
  const [rawHtml, setRawHtml] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('html');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const agentIds = AGENTS.map(a => a.id);

  const run = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setRenderedHtml('');
    setLogs([]);
    setMetadata(null);
    try {
      const agent = AGENTS.find(a => a.id === userAgent);
      const snap = await fetchSnapshot(url, agent ? agent.ua : userAgent);
      setRawHtml(snap.html);
      setMetadata(parseMetadata(snap.html));
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
        if (doc) {
          const html = doc.documentElement.outerHTML;
          setRenderedHtml(html);
          setMetadata(parseMetadata(html));
        }
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

  const copyOutput = async () => {
    const html = renderedHtml || rawHtml;
    if (!html) return;
    try {
      if (exportFormat === 'html') {
        await navigator.clipboard.writeText(html);
      } else {
        await navigator.clipboard.writeText(
          JSON.stringify({ rawHtml, renderedHtml, metadata }, null, 2),
        );
      }
    } catch {
      // ignore clipboard errors
    }
  };

  const exportOutput = () => {
    const html = renderedHtml || rawHtml;
    if (!html) return;
    const data =
      exportFormat === 'html'
        ? html
        : JSON.stringify({ rawHtml, renderedHtml, metadata }, null, 2);
    const type = exportFormat === 'html' ? 'text/html' : 'application/json';
    const ext = exportFormat === 'html' ? 'html' : 'json';
    const blob = new Blob([data], { type });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `rendered.${ext}`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return {
    url,
    setUrl,
    delay,
    setDelay,
    userAgent,
    setUserAgent,
    exportFormat,
    setExportFormat,
    agentIds,
    run,
    loading,
    error,
    iframeRef,
    srcDoc,
    rawHtml,
    renderedHtml,
    metadata,
    logs,
    copyOutput,
    exportOutput,
  };
};

export default useFetchRender;

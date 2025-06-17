/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import {
  RedirectHop,
  parseUtmParams,
  fetchOpenGraph,
  OpenGraphPreview,
  followRedirectChainRemote,
} from '../model/deepLinkChain';

export const useDeepLinkChain = (initialUrl = '') => {
  const [url, setUrl] = useState(initialUrl);
  const [chain, setChain] = useState<RedirectHop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openGraph, setOpenGraph] = useState<OpenGraphPreview | null>(null);

  const run = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setOpenGraph(null);
    try {
      const hops = await followRedirectChainRemote(url);
      setChain(hops);
      const last = hops[hops.length - 1];
      if (last) {
        const og = await fetchOpenGraph(last.url);
        if (og) setOpenGraph(og);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(chain, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'redirect-chain.json';
    a.click();
    URL.revokeObjectURL(href);
  };

  const exportMarkdown = () => {
    const lines = chain.map((h, i) => `- [${i === chain.length - 1 ? 'Final' : `Hop ${i + 1}`}] ${h.url}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'redirect-chain.md';
    a.click();
    URL.revokeObjectURL(href);
  };

  const copyMarkdown = async () => {
    const rows = chain.map((h, i) => `| ${i + 1} | ${h.url} | ${h.status ?? ''} |`);
    const table = ['| Hop | URL | Status |', '| --- | --- | --- |', ...rows].join('\n');
    await navigator.clipboard.writeText(table);
  };

  const utmParams = chain.length ? parseUtmParams(chain[chain.length - 1].url) : {};

  return {
    url,
    setUrl,
    chain,
    loading,
    error,
    run,
    exportJson,
    exportMarkdown,
    copyMarkdown,
    utmParams,
    openGraph,
  };
};

export default useDeepLinkChain;


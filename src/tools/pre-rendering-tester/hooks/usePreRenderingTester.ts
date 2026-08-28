/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useMemo, useState } from 'react';
import { fetchSnapshot, Snapshot } from '../lib/prerender';
import { copyText } from '../../../shared/utils/clipboard';

export interface Agent {
  id: string;
  ua: string;
  category: 'SEO Crawler' | 'Browser' | 'Social Bot';
}

export const AGENTS: Agent[] = [
  {
    id: 'Googlebot',
    ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    category: 'SEO Crawler',
  },
  {
    id: 'Bingbot',
    ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    category: 'SEO Crawler',
  },
  {
    id: 'FacebookBot',
    ua: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    category: 'Social Bot',
  },
  {
    id: 'Desktop Chrome',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    category: 'Browser',
  },
];

export const USER_AGENTS: Record<string, string> = Object.fromEntries(
  AGENTS.map(a => [a.id, a.ua])
);

export const usePreRenderingTester = () => {
  const [url, setUrl] = useState('');
  const [agents, setAgents] = useState<string[]>([]);
  const [results, setResults] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleAgent = (id: string) => {
    setAgents(prev => (prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]));
  };

  const run = async () => {
    if (!url || agents.length === 0) return;
    setLoading(true);
    setResults([]);
    setError('');
    try {
      const snaps = await Promise.all(
        agents.map(id => {
          const agent = AGENTS.find(a => a.id === id)!;
          return fetchSnapshot(url, agent.ua).then(s => ({ ...s, userAgent: id }));
        })
      );
      setResults(snaps);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    await copyText(JSON.stringify(results, null, 2));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'prerender-results.json';
    a.click();
    URL.revokeObjectURL(href);
  };

  const summary = useMemo(() => {
    if (!results.length) return '';
    const agentsTested = results.length;
    const titlesMatch = results.every(r => r.title === results[0].title);
    const descMatch = results.every(r => r.description === results[0].description);
    const missingH1 = results.some(r => !r.h1);
    const descLen = results[0].description?.length ?? 0;
    const ogMismatch = results.some(r => r.ogTitle !== results[0].ogTitle || r.ogDescription !== results[0].ogDescription);
    const hasCanonical = results.some(r => !!r.canonical);
    return `${agentsTested} agents • ${titlesMatch ? '✅ Titles match' : '⚠️ Title mismatch'} • ${descMatch ? '✅ Descriptions match' : '⚠️ Description mismatch'} • ${missingH1 ? '⚠️ Missing H1' : '✅ H1 present'} • ${ogMismatch ? '⚠️ OpenGraph mismatch' : '✅ OG consistent'} • ${hasCanonical ? '✅ Canonical' : '⚠️ No canonical'} • 📏 Description: ${descLen} chars`;
  }, [results]);

  const copySnapshot = async (snap: Snapshot) => {
    await copyText(JSON.stringify(snap, null, 2));
  };

  return {
    url,
    setUrl,
    agents,
    toggleAgent,
    results,
    run,
    loading,
    error,
    copyJson,
    exportJson,
    summary,
    copySnapshot,
  };
};

export default usePreRenderingTester;

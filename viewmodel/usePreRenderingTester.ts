/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import { fetchSnapshot, Snapshot } from '../model/prerender';

export const USER_AGENTS: Record<string, string> = {
  Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  Bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Desktop Chrome':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
};

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
        agents.map(id =>
          fetchSnapshot(url, USER_AGENTS[id]).then(s => ({ ...s, userAgent: id }))
        )
      );
      setResults(snaps);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
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

  return { url, setUrl, agents, toggleAgent, results, run, loading, error, copyJson, exportJson };
};

export default usePreRenderingTester;

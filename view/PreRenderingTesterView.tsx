/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { AGENTS, Agent } from '../viewmodel/usePreRenderingTester';
import { Card } from '../src/design-system/components/layout/Card';
import { Button } from '../src/design-system/components/inputs/Button';
import { Badge } from '../src/design-system/components/display/Badge';
import { Snapshot } from '../model/prerender';

interface Props {
  url: string;
  setUrl: (v: string) => void;
  agents: string[];
  toggleAgent: (id: string) => void;
  run: () => void;
  loading: boolean;
  error: string;
  results: Snapshot[];
  copyJson: () => void;
  exportJson: () => void;
  summary: string;
  copySnapshot: (snap: Snapshot) => void;
}

export function PreRenderingTesterView({
  url,
  setUrl,
  agents,
  toggleAgent,
  run,
  loading,
  error,
  results,
  copyJson,
  exportJson,
  summary,
  copySnapshot,
}: Props) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const toggleHtml = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const grouped = React.useMemo(() => {
    const map: Record<string, Agent[]> = {};
    AGENTS.forEach(a => {
      if (!map[a.category]) map[a.category] = [];
      map[a.category].push(a);
    });
    return map;
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pre-rendering & SEO Meta Tester</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Test how Googlebot, Bingbot, Facebook, and real users see your web content — including title, description, H1, and rendering accuracy.
        </p>
      </div>

      <div className={`${TOOL_PANEL_CLASS} space-y-4`}>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="url" className="text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <div className="space-y-3">
          {Object.entries(grouped).map(([cat, ags]) => (
            <div key={cat} className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-semibold mr-2 text-gray-700 dark:text-gray-300">{cat}</span>
              {ags.map(a => (
                <label
                  key={a.id}
                  htmlFor={`agent-${a.id}`}
                  className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    id={`agent-${a.id}`}
                    type="checkbox"
                    checked={agents.includes(a.id)}
                    onChange={() => toggleAgent(a.id)}
                    className="mr-1"
                  />
                  {a.id}
                </label>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={run} isLoading={loading} disabled={loading || !url || agents.length === 0}>
            Fetch
          </Button>
        </div>
        {error && <div className="text-red-600" aria-live="polite">{error}</div>}
      </div>

      {results.length > 0 && (
        <div className="sticky top-0 bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-4 py-2 rounded-md shadow-sm">
          {summary}
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(r => (
            <Card key={r.userAgent} isElevated>
              <Card.Header
                title={<span className="font-medium">{r.userAgent}</span>}
                actions={<Badge variant={r.status === 200 ? 'success' : 'danger'}>{r.status}</Badge>}
              />
              <Card.Body className="space-y-1 text-sm break-words">
                <div><strong>Title:</strong> {r.title ?? '-'}</div>
                <div><strong>Description:</strong> {r.description ?? '-'}</div>
                <div><strong>H1 Tag:</strong> {r.h1 ?? '-'}</div>
              </Card.Body>
              <Card.Footer align="between">
                <Button size="sm" variant="secondary" onClick={() => copySnapshot(r)}>Copy JSON</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleHtml(r.userAgent)}>
                  {expanded[r.userAgent] ? 'Hide HTML' : 'View Raw HTML'}
                </Button>
              </Card.Footer>
              {expanded[r.userAgent] && (
                <pre className="text-xs overflow-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-b-md">{r.html}</pre>
              )}
            </Card>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline-primary" onClick={copyJson}>Copy All JSON</Button>
          <Button size="sm" variant="outline-primary" onClick={exportJson}>Download JSON</Button>
        </div>
      )}
    </div>
  );
}

export default PreRenderingTesterView;

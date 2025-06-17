/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { ResponsiveContainer } from '../src/design-system/components/layout/ResponsiveContainer';
import { CodeBlock } from '../src/design-system/components/display/CodeBlock';
import { TabGroup, Tab, TabPanel } from '../src/design-system/components/navigation';
import { Button } from '../src/design-system/components/inputs/Button';

/* eslint-disable react/require-default-props */

interface Props {
  url: string;
  setUrl: (v: string) => void;
  delay: number;
  setDelay: (v: number) => void;
  userAgent: string;
  setUserAgent: (v: string) => void;
  agentIds: string[];
  exportFormat: 'html' | 'json';
  setExportFormat: (v: 'html' | 'json') => void;
  run: () => void;
  loading: boolean;
  error: string;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  srcDoc?: string;
  rawHtml: string;
  renderedHtml: string;
  metadata: { title: string | null; description: string | null; h1: string | null } | null;
  logs: string[];
  copyOutput: () => void;
  exportOutput: () => void;
}

export function FetchRenderView({
  url,
  setUrl,
  delay,
  setDelay,
  userAgent,
  setUserAgent,
  agentIds,
  exportFormat,
  setExportFormat,
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
}: Props) {
  const [showAll, setShowAll] = React.useState(false);
  const lines = rawHtml.split('\n');
  const truncated = lines.slice(0, 30).join('\n');

  return (
    <ResponsiveContainer maxWidth="5xl" className="py-6">
      <div className={TOOL_PANEL_CLASS}>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Fetch &amp; Render</h2>
        <div className="space-y-4">
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
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="delay" className="text-sm font-medium text-gray-700 dark:text-gray-300">Delay (s)</label>
            <input
              id="delay"
              type="number"
              min="0"
              max="10"
              value={delay}
              onChange={e => setDelay(Number(e.target.value))}
              className="border p-1 w-20 rounded dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="ua" className="text-sm font-medium text-gray-700 dark:text-gray-300">User-Agent</label>
            <select
              id="ua"
              value={userAgent}
              onChange={e => setUserAgent(e.target.value)}
              className="border p-1 rounded dark:bg-gray-700 dark:text-gray-200 mt-1"
            >
              {agentIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={run} isLoading={loading} disabled={loading || !url}>Fetch &amp; Render</Button>
          </div>
          {error && <div className="text-red-600" aria-live="polite">{error}</div>}

          {srcDoc && (
            <iframe ref={iframeRef} srcDoc={srcDoc} title="render" className="w-full h-64 border" />
          )}

          {(rawHtml || renderedHtml) && (
            <TabGroup>
              <div>
                <Tab id="raw" label="Raw HTML" />
                <Tab id="dom" label="DOM Snapshot" />
                <Tab id="meta" label="Meta Tags" />
              </div>

              <TabPanel id="raw">
                <CodeBlock maxHeight="24rem">{showAll ? rawHtml : truncated}</CodeBlock>
                {lines.length > 30 && (
                  <Button size="sm" variant="ghost" onClick={() => setShowAll(v => !v)}>
                    {showAll ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </TabPanel>

              <TabPanel id="dom">
                <CodeBlock maxHeight="24rem">{renderedHtml}</CodeBlock>
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={exportFormat}
                    onChange={e => setExportFormat(e.target.value as 'html' | 'json')}
                    className="border p-1 rounded dark:bg-gray-700 dark:text-gray-200"
                  >
                    <option value="html">HTML</option>
                    <option value="json">JSON</option>
                  </select>
                  <Button size="sm" variant="secondary" onClick={copyOutput}>Copy</Button>
                  <Button size="sm" variant="secondary" onClick={exportOutput}>Download</Button>
                </div>
              </TabPanel>

              <TabPanel id="meta">
                {metadata && (
                  <table className="text-sm w-full">
                    <tbody>
                      <tr><td className="font-medium pr-2">Title</td><td>{metadata.title || '-'}</td></tr>
                      <tr><td className="font-medium pr-2">Description</td><td>{metadata.description || '-'}</td></tr>
                      <tr><td className="font-medium pr-2">H1</td><td>{metadata.h1 || '-'}</td></tr>
                    </tbody>
                  </table>
                )}
              </TabPanel>
            </TabGroup>
          )}

          {logs.length > 0 && (
            <div className="bg-zinc-900 text-red-500 p-4 rounded-md relative">
              <div className="font-semibold mb-2">Console Output</div>
              <CodeBlock className="!bg-transparent" maxHeight="12rem">{logs.join('\n')}</CodeBlock>
              <Button size="xs" variant="ghost" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(logs.join('\n'))}>Copy</Button>
            </div>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  );
}

export default FetchRenderView;

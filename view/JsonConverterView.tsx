/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { Button } from '../src/design-system/components/inputs';

interface Props {
  input: string;
  setInput: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
  output: string;
  flatten: boolean;
  setFlatten: (v: boolean) => void;
  header: boolean;
  setHeader: (v: boolean) => void;
  eol: 'LF' | 'CRLF';
  setEol: (v: 'LF' | 'CRLF') => void;
  filename: string;
  setFilename: (v: string) => void;
  error: string;
  format: () => void;
  clear: () => void;
  loadExample: () => void;
  uploadFile: (f: File) => void;
  fetchUrl: () => void;
  convert: () => void;
  copyOutput: () => void;
  downloadCsv: () => void;
  downloadExcel: () => void;
}

export function JsonConverterView({
  input,
  setInput,
  url,
  setUrl,
  output,
  flatten,
  setFlatten,
  header,
  setHeader,
  eol,
  setEol,
  filename,
  setFilename,
  error,
  format,
  clear,
  loadExample,
  uploadFile,
  fetchUrl,
  convert,
  copyOutput,
  downloadCsv,
  downloadExcel,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`${TOOL_PANEL_CLASS.replace('p-6', 'p-4')} space-y-4`}>
          <textarea
            className="w-full border px-2 py-1 rounded h-40 dark:bg-gray-700 dark:text-gray-200"
            placeholder="Paste JSON here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <input
            type="file"
            accept=".json,.txt,application/json,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
            }}
          />
          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 border px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200"
              placeholder="https://example.com/data.json"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button size="sm" onClick={fetchUrl}>Fetch</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={format}>Format</Button>
            <Button size="sm" variant="secondary" onClick={clear}>Clear</Button>
            <Button size="sm" variant="outline" onClick={loadExample}>Example</Button>
            <Button size="sm" onClick={convert}>Convert</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label htmlFor="flatten" className="inline-flex items-center">
              <input
                id="flatten"
                type="checkbox"
                className="form-checkbox h-4 w-4"
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
              />
              <span className="ml-1">Flatten</span>
            </label>
            <label htmlFor="header" className="inline-flex items-center">
              <input
                id="header"
                type="checkbox"
                className="form-checkbox h-4 w-4"
                checked={header}
                onChange={(e) => setHeader(e.target.checked)}
              />
              <span className="ml-1">Header</span>
            </label>
            <select
              className="border px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-200"
              value={eol}
              onChange={(e) => setEol(e.target.value as 'LF' | 'CRLF')}
            >
              <option value="LF">LF</option>
              <option value="CRLF">CRLF</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <div className={`${TOOL_PANEL_CLASS.replace('p-6', 'p-4')} space-y-2`}>
          <textarea
            className="w-full border px-2 py-1 rounded h-40 font-mono dark:bg-gray-700 dark:text-gray-200"
            readOnly
            value={output}
          />
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm" onClick={copyOutput}>Copy</Button>
            <input
              type="text"
              className="border px-2 py-1 rounded flex-1 dark:bg-gray-700 dark:text-gray-200"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="filename"
            />
            <Button size="sm" variant="secondary" onClick={downloadCsv}>Download CSV</Button>
            <Button size="sm" variant="secondary" onClick={downloadExcel}>Download Excel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JsonConverterView;

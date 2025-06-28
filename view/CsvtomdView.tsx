/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';

interface Props {
  csv: string;
  setCsv: (v: string) => void;
  uploadFile: (f: File) => void;
  delimiter: string;
  setDelimiter: (d: string) => void;
  headers: string[];
  alignment: string[];
  toggleAlignment: (i: number) => void;
  markdown: string;
  copyMarkdown: () => void;
  downloadMarkdown: () => void;
  error: string;
}

export function CsvtomdView({
  csv,
  setCsv,
  uploadFile,
  delimiter,
  setDelimiter,
  headers,
  alignment,
  toggleAlignment,
  markdown,
  copyMarkdown,
  downloadMarkdown,
  error,
}: Props) {
  return (
    <div className={`${TOOL_PANEL_CLASS.replace('p-6', 'p-4')} space-y-4`}>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={6}
        className="w-full border px-2 py-1 rounded font-mono"
        placeholder="Paste CSV here"
      />
      <div className="flex items-center gap-2 text-sm">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
          }}
        />
        <label htmlFor="delimiter" className="flex items-center gap-1">
          Delimiter
          <select
            id="delimiter"
            className="border px-1 py-0.5 rounded"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
          >
            <option value=",">,</option>
            <option value=";">;</option>
            <option value="\t">Tab</option>
            <option value="|">|</option>
          </select>
        </label>
      </div>
      {alignment.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {alignment.map((a, i) => (
            <button
              key={headers[i] || i}
              type="button"
              className="border px-2 py-1 rounded"
              onClick={() => toggleAlignment(i)}
            >
              {a}
            </button>
          ))}
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      {markdown && (
        <>
          <textarea
            readOnly
            value={markdown}
            rows={Math.min(10, markdown.split('\n').length + 2)}
            className="w-full border px-2 py-1 rounded font-mono overflow-auto"
          />
          <div className="flex gap-4 text-sm text-blue-600">
            <button type="button" className="underline" onClick={copyMarkdown}>
              Copy Markdown
            </button>
            <button type="button" className="underline" onClick={downloadMarkdown}>
              Download .md
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CsvtomdView;

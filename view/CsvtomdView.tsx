/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { Button, SelectInput } from '../src/design-system/components/inputs';
import { InfoBox } from '../src/design-system/components/display/InfoBox';

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
      <label htmlFor="csv-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        CSV Source
        <textarea
          id="csv-input"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={6}
          className="w-full mt-1 border px-3 py-2 rounded font-mono dark:bg-gray-700 dark:text-gray-200"
          placeholder="Paste CSV here"
        />
      </label>
      <div className="flex items-center gap-4 text-sm">
        <label htmlFor="csv-file" className="block text-sm font-medium">
          <span className="sr-only">Upload CSV</span>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
            }}
          />
        </label>
        <SelectInput
          id="delimiter"
          label="Delimiter"
          value={delimiter}
          onChange={setDelimiter}
          options={[
            { value: ',', label: ',' },
            { value: ';', label: ';' },
            { value: '\t', label: 'Tab' },
            { value: '|', label: '|' },
          ]}
          className="w-28"
        />
      </div>
      {alignment.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {alignment.map((a, i) => (
            <Button
              key={headers[i] || i}
              size="sm"
              variant="outline-secondary"
              onClick={() => toggleAlignment(i)}
            >
              {a}
            </Button>
          ))}
        </div>
      )}
      {error && (
        <InfoBox title="Error" variant="error" className="mt-2">
          {error}
        </InfoBox>
      )}
      {markdown && (
        <>
          <textarea
            readOnly
            value={markdown}
            rows={Math.min(10, markdown.split('\n').length + 2)}
            className="w-full border px-3 py-2 rounded font-mono overflow-auto dark:bg-gray-700 dark:text-gray-200"
          />
          <div className="flex gap-2 text-sm">
            <Button size="sm" variant="secondary" onClick={copyMarkdown}>
              Copy Markdown
            </Button>
            <Button size="sm" variant="secondary" onClick={downloadMarkdown}>
              Download .md
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default CsvtomdView;

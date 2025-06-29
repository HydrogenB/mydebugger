/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { Button, SelectInput } from '../src/design-system/components/inputs';
import { CodeBlock } from '../src/design-system/components/display/CodeBlock';

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
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`${TOOL_PANEL_CLASS.replace('p-6', 'p-4')} space-y-4`}>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={8}
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
            <SelectInput
              value={delimiter}
              onChange={setDelimiter}
              label="Delimiter"
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
                  variant="secondary"
                  onClick={() => toggleAlignment(i)}
                >
                  {a}
                </Button>
              ))}
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <div className={`${TOOL_PANEL_CLASS.replace('p-6', 'p-4')} space-y-2`}>
          {markdown ? (
            <>
              <CodeBlock maxHeight="20rem">{markdown}</CodeBlock>
              <div className="flex gap-2">
                <Button size="sm" onClick={copyMarkdown}>Copy</Button>
                <Button size="sm" variant="secondary" onClick={downloadMarkdown}>
                  Download
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Paste CSV to generate Markdown.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CsvtomdView;

import React, { ChangeEvent } from 'react';
import type { UseJsonCompareVM } from '../hooks/useJsonCompare';
import { Button, Card, CodeEditor } from '@design-system';

const Counter: React.FC<{ color: 'green' | 'red' | 'amber'; label: string; value: number; }> = ({ color, label, value }) => {
  const colorMap: Record<'green' | 'red' | 'amber', string> = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
  };
  return (
    <div className="flex items-center space-x-1 text-sm">
      <span className={`inline-block w-2 h-2 rounded-full ${colorMap[color]}`} />
      <span className="text-gray-700 dark:text-gray-200">{label} ({value})</span>
    </div>
  );
};

const HeaderBar: React.FC<{
  onCompare: () => void;
  onFormat: () => void;
  onClear: () => void;
  onExport: () => void;
  added: number;
  removed: number;
  modified: number;
}> = ({ onCompare, onFormat, onClear, onExport, added, removed, modified }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div className="flex items-center gap-2">
      <Button onClick={onCompare} variant="primary">Compare JSON</Button>
      <Button onClick={onFormat} variant="secondary">Format</Button>
      <Button onClick={onClear} variant="secondary">Clear</Button>
      <Button onClick={onExport} variant="ghost">Export</Button>
    </div>
    <div className="flex items-center gap-4">
      <Counter color="green" label="Added" value={added} />
      <Counter color="red" label="Removed" value={removed} />
      <Counter color="amber" label="Modified" value={modified} />
    </div>
  </div>
);

const EditorHeader: React.FC<{
  title: string;
  onUpload: (f: File) => void;
  extraRight?: React.ReactNode;
}> = ({ title, onUpload, extraRight }) => {
  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</div>
      <div className="flex items-center gap-2">
        {extraRight}
        <label className="inline-flex items-center px-3 py-1.5 border rounded-md text-sm cursor-pointer bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50">
          Upload
          <input type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
        </label>
      </div>
    </div>
  );
};

const TextArea: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  onSubmit?: () => void;
}> = ({ value, onChange, placeholder, error, onSubmit }) => (
  <div>
    <CodeEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      language="json"
      ariaLabel="JSON editor"
      onSubmit={onSubmit}
      invalid={!!error}
      showToolbar
      enableHighlight
    />
    {error && <div className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</div>}
  </div>
);

const JsonComparePanel: React.FC<UseJsonCompareVM> = ({
  leftText, rightText,
  setLeftText, setRightText,
  leftError, rightError,
  summary,
  onCompare, onFormat, onClear, onExport,
  onUploadLeft, onUploadRight, onLoadSample,
}) => {
  return (
    <div>
      <HeaderBar
        onCompare={onCompare}
        onFormat={onFormat}
        onClear={onClear}
        onExport={onExport}
        added={summary.added}
        removed={summary.removed}
        modified={summary.modified}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-3">
          <EditorHeader
            title="Original JSON"
            onUpload={onUploadLeft}
            extraRight={
              <button
                type="button"
                onClick={onLoadSample}
                className="px-3 py-1.5 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                Sample
              </button>
            }
          />
          <TextArea value={leftText} onChange={setLeftText} placeholder="{"} Enter or upload JSON..." error={leftError} onSubmit={onCompare} />
        </Card>
        <Card className="p-3">
          <EditorHeader title="Comparison JSON" onUpload={onUploadRight} />
          <TextArea value={rightText} onChange={setRightText} placeholder="{"} Enter or upload JSON..." error={rightError} onSubmit={onCompare} />
        </Card>
      </div>
    </div>
  );
};

export default JsonComparePanel;



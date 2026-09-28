/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React, { useEffect, useRef, useState } from 'react';
import type { UseImageCompressorReturn } from '../hooks/useImageCompressor';
import { formatBytes, outputName } from '../lib/format';
import { OUTPUT_FORMATS, type FormatChoice } from '../lib/types';
import FileRow from './FileRow';

export { formatBytes, outputName };

const LABEL: Record<FormatChoice, string> = {
  original: 'Original', png: 'PNG', jpg: 'JPG', webp: 'WebP', gif: 'GIF', bmp: 'BMP',
};
const CHOICES: FormatChoice[] = ['original', ...OUTPUT_FORMATS];

const saveBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  // Revoking synchronously can abort the download in Safari/Firefox.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function ImageCompressorView({
  format, setFormat, items, addFiles, removeItem, clear, unavailable,
}: UseImageCompressorReturn) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) addFiles(files);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles]);

  const done = items.filter((it) => it.status === 'done' && it.result);
  const inputTotal = done.reduce((n, it) => n + it.file.size, 0);
  const outputTotal = done.reduce((n, it) => n + (it.result?.report.outputBytes ?? 0), 0);
  const pct = Math.round(Math.abs(1 - outputTotal / inputTotal) * 100);
  let summary = 'Compressing…';
  if (done.length > 0) {
    summary = outputTotal > inputTotal
      ? `Output is ${formatBytes(outputTotal - inputTotal)} larger than input (+${pct}%)`
      : `Saved ${formatBytes(inputTotal - outputTotal)} total (−${pct}%)`;
  }

  const downloadAll = async () => {
    const { zipSync } = await import('fflate');
    const used = new Map<string, number>();
    const entries: Record<string, Uint8Array> = {};
    done.forEach((it) => {
      const base = outputName(it.file.name, it.result!.ext);
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      const name = n === 1 ? base : base.replace(/(\.[^.]+)$/, `-${n}$1`);
      entries[name] = it.result!.bytes;
    });
    // Images are already compressed; store without deflate.
    saveBlob(new Blob([zipSync(entries, { level: 0 })], { type: 'application/zip' }), 'compressed-images.zip');
  };

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Output format" className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
        {CHOICES.map((f) => {
          const off = f !== 'original' && unavailable.includes(f);
          let title: string | undefined;
          if (off) title = 'This encoder failed to load. Check your connection and reload.';
          else if (f === 'original') title = 'Keep each file’s format — just make it smaller';
          return (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={format === f}
              disabled={off}
              title={title}
              onClick={() => setFormat(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                format === f ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {LABEL[f]}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const files = Array.from(e.dataTransfer?.files ?? []);
          if (files.length) addFiles(files);
        }}
        className={`w-full rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-primary-400'
        }`}
      >
        <span className="block text-lg font-semibold text-gray-800 dark:text-gray-100">
          Drop images here, or click to browse
        </span>
        <span className="mt-1 block text-sm text-gray-500">
          PNG · JPG · WebP · GIF · BMP · up to 20 files, 50 MB each · paste works too
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        aria-label="Choose images"
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) addFiles(files);
          e.target.value = '';
        }}
      />

      {items.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ul>
            {items.map((it) => <FileRow key={it.id} item={it} onRemove={removeItem} />)}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700 px-4 py-3 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {summary}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={clear} className="rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                Clear
              </button>
              <button
                type="button"
                onClick={() => { void downloadAll(); }}
                disabled={done.length === 0}
                className="rounded-md bg-primary-500 px-3 py-1.5 font-medium text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Download all (.zip)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React, { useEffect, useState } from 'react';
import type { QueueItem } from '../hooks/useImageCompressor';
import { formatBytes, outputName } from '../lib/format';
import type { Mode } from '../lib/types';

const MODE_LABEL: Record<Mode, string> = {
  lossless: 'Lossless',
  'visually-lossless': 'Visually lossless',
  'below-target': 'Below quality target',
  'already-optimal': 'Already optimal',
};

const useObjectUrl = (blob: Blob | null) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) return undefined;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
};

function CompareSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:16px_16px]">
      <img src={after} alt="Compressed" className="block w-full" />
      <img
        src={before}
        alt="Original"
        className="absolute inset-0 block w-full h-full object-contain"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} aria-hidden />
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare original and compressed"
        className="absolute inset-x-0 bottom-2 mx-auto w-2/3 accent-primary-500"
      />
    </div>
  );
}

export default function FileRow({ item, onRemove }: { item: QueueItem; onRemove: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const { file, status, result } = item;
  const resultBlob = React.useMemo(
    () => (result ? new Blob([result.bytes], { type: result.mime }) : null),
    [result],
  );
  const downloadUrl = useObjectUrl(resultBlob);
  const beforeUrl = useObjectUrl(open ? file : null);
  const name = result ? outputName(file.name, result.ext) : file.name;
  const saved = result ? Math.round((1 - result.report.outputBytes / file.size) * 100) : 0;

  return (
    <li className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3 text-sm">
        <span className="flex-1 truncate font-medium" title={file.name}>{file.name}</span>
        <span className="w-20 text-right text-gray-500 tabular-nums">{formatBytes(file.size)}</span>
        <div className="w-40 sm:w-56" aria-live="polite">
          {status === 'queued' && <span className="text-gray-400">Queued</span>}
          {status === 'working' && (
            <div>
              <div className="h-1.5 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full w-1/2 animate-pulse bg-primary-500" />
              </div>
              <span className="text-xs text-gray-500">{item.step}…</span>
            </div>
          )}
          {status === 'error' && <span className="text-red-600 dark:text-red-400">{item.error}</span>}
          {status === 'done' && result && (
            <span className="tabular-nums">
              {formatBytes(result.report.outputBytes)}{' '}
              <span className={saved > 0 ? 'font-semibold text-green-600 dark:text-green-400' : 'text-gray-500'}>
                {saved > 0 ? `−${saved}%` : `${-saved > 0 ? '+' : ''}${-saved}%`}
              </span>
            </span>
          )}
        </div>
        {status === 'done' && downloadUrl && (
          <a
            href={downloadUrl}
            download={name}
            aria-label={`Download ${name}`}
            className="rounded-md bg-primary-500 px-3 py-1 text-white hover:bg-primary-600"
          >
            ⬇
          </a>
        )}
        {status === 'done' && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`Details for ${file.name}`}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {open ? '▾' : '▸'}
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${file.name}`}
          className="rounded-md px-2 py-1 text-gray-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
      {open && result && (
        <div className="grid gap-4 px-4 pb-4 md:grid-cols-2">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-gray-500">Pipeline</dt>
            <dd>{result.report.pipeline}</dd>
            <dt className="text-gray-500">Mode</dt>
            <dd>{MODE_LABEL[result.report.mode]}</dd>
            {result.report.ssim !== null && (
              <>
                <dt className="text-gray-500">SSIM</dt>
                <dd className="tabular-nums">{result.report.ssim.toFixed(4)}</dd>
              </>
            )}
            <dt className="text-gray-500">Size</dt>
            <dd className="tabular-nums">
              {formatBytes(result.report.inputBytes)} → {formatBytes(result.report.outputBytes)}
            </dd>
            <dt className="text-gray-500">Image type</dt>
            <dd>{result.report.cls}</dd>
            {result.report.warnings.map((w) => (
              <dd key={w} className="col-span-2 text-amber-700 dark:text-amber-400">{w}</dd>
            ))}
            {result.report.skipped.length > 0 && (
              <dd className="col-span-2 text-xs text-gray-500">Skipped: {result.report.skipped.join('; ')}</dd>
            )}
          </dl>
          {beforeUrl && downloadUrl && <CompareSlider before={beforeUrl} after={downloadUrl} />}
        </div>
      )}
    </li>
  );
}

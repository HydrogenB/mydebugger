'use client';
/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import useLinkTracer from '@/viewmodel/useLinkTracer';

export default function LinkTracer() {
  const [url, setUrl] = useState('');
  const [hops, setHops] = useState(10);
  const { steps, loading, error, trace } = useLinkTracer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) trace(url, hops);
  };

  return (
    <section className="p-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <input
          type="text"
          className="flex-grow rounded border border-gray-300 px-2 py-1"
          placeholder="Dynamic Link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          type="number"
          className="w-24 rounded border border-gray-300 px-2 py-1"
          value={hops}
          onChange={(e) => setHops(parseInt(e.target.value, 10))}
          min={1}
          max={20}
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Trace
        </button>
      </form>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <ul className="mt-4 divide-y rounded border">
        {steps.map((step, idx) => (
          <li key={idx} className="px-2 py-1">
            <div className="font-medium">{`${idx + 1}. ${step.url}`}</div>
            <div className="text-sm text-gray-600">
              {step.error ? step.error : `Status: ${step.status}`}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

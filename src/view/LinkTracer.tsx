'use client';
/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import useLinkTracer from '@/viewmodel/useLinkTracer';
import { Textbox, Button } from '@/view/ui';

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
        <Textbox
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Dynamic Link"
          className="flex-grow"
        />
        <Textbox
          type="number"
          value={hops}
          onChange={(e) => setHops(parseInt(e.target.value, 10))}
          min={1}
          max={20}
          className="w-24"
        />
        <Button type="submit" loading={loading}>
          Trace
        </Button>
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

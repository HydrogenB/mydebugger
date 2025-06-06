/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import { TraceStep } from '@/model/linkTracer';

export default function useLinkTracer() {
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trace = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/link-tracer?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data: TraceStep[] = await res.json();
      setSteps(data);
    } catch (err) {
      setError((err as Error).message);
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  return { steps, loading, error, trace };
}

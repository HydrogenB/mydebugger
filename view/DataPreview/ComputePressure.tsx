/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Compute Pressure Preview - displays latest CPU state
 */
import React, { useEffect, useState } from 'react';

interface ComputePressureProps {
  data: { observer: { disconnect(): void }; readings: unknown[] };
  onStop: () => void;
}

function ComputePressure({ data, onStop }: ComputePressureProps) {
  const [lastReading, setLastReading] = useState<unknown>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data.readings.length > 0) {
        setLastReading(data.readings[data.readings.length - 1]);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
      data.observer.disconnect();
      onStop();
    };
  }, [data, onStop]);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm">
      <pre className="whitespace-pre-wrap break-words">{JSON.stringify(lastReading, null, 2)}</pre>
    </div>
  );
}

export default ComputePressure;

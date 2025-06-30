/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { Button } from '../src/design-system/components/inputs';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  start: () => void;
  stop: () => void;
  flip: () => void;
  result: string;
  error: string;
  scanning: boolean;
  canFlip: boolean;
}

export function QrscanView({
  videoRef,
  start,
  stop,
  flip,
  result,
  error,
  scanning,
  canFlip,
}: Props) {
  return (
    <div className={TOOL_PANEL_CLASS}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        QR Scanner
      </h2>
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex flex-col items-center">
        <video
          ref={videoRef}
          className="w-64 h-64 border rounded-md"
          aria-label="QR code scanner feed"
        >
          <track kind="captions" className="sr-only" />
        </video>
        <div className="flex gap-2 mt-2">
          <Button onClick={start} isDisabled={scanning} size="sm">
            Start
          </Button>
          <Button onClick={stop} isDisabled={!scanning} size="sm" variant="secondary">
            Stop
          </Button>
          {canFlip && (
            <Button onClick={flip} size="sm" variant="outline-primary">
              Flip
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1">
        <p className="font-semibold mb-1 text-gray-700 dark:text-gray-300">Result:</p>
        <div className="p-2 border rounded min-h-[4rem] break-all bg-gray-50 dark:bg-gray-800">
          {result || 'Waiting...'}
        </div>
        {result && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              Copy
            </Button>
            <Button size="sm" variant="outline-primary" href={result} target="_blank">
              Open
            </Button>
          </div>
        )}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
      </div>
    </div>
  );
}

export default QrscanView;

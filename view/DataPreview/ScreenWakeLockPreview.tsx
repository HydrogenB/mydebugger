/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Screen Wake Lock Preview Component - Shows screen lock status and controls
 */
import React, { useState, useEffect } from 'react';
import { FiSun, FiX, FiPlay, FiPause } from 'react-icons/fi';

interface WakeLock {
  type: 'screen';
  released: boolean;
  release: () => Promise<void>;
}

interface ScreenWakeLockPreviewProps {
  wakeLock?: WakeLock;
  onStop: () => void;
}

function ScreenWakeLockPreview({ wakeLock, onStop }: ScreenWakeLockPreviewProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>('00:00:00');

  useEffect(() => {
    if (wakeLock) {
      setIsActive(!wakeLock.released);
      if (!wakeLock.released && !startTime) {
        setStartTime(new Date());
      }
    }
  }, [wakeLock, startTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setDuration(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);

  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) {
      setError('Screen Wake Lock API not supported');
      return;
    }

    setError('');
    try {
      await (navigator as Navigator & {
        wakeLock: {
          request: (type: 'screen') => Promise<WakeLock>;
        };
      }).wakeLock.request('screen');
      
      setIsActive(true);
      setStartTime(new Date());
    } catch (err) {
      setError(`Failed to request wake lock: ${(err as Error).message}`);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock && !wakeLock.released) {
      try {
        await wakeLock.release();
        setIsActive(false);
        setStartTime(null);
      } catch (err) {
        setError(`Failed to release wake lock: ${(err as Error).message}`);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Screen Wake Lock
          </h4>
        </div>
        <button
          type="button"
          onClick={onStop}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 p-3 rounded border space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Status:</div>
            <div className={`text-sm font-medium ${
              isActive 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {isActive ? 'Screen locked awake' : 'Not active'}
            </div>
          </div>
          
          <div className={`w-3 h-3 rounded-full ${
            isActive 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-gray-400'
          }`} />
        </div>

        {isActive && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Active duration: <span className="font-mono">{duration}</span>
            </div>
            {startTime && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Started: {startTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!isActive ? (
            <button
              type="button"
              onClick={requestWakeLock}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
            >
              <FiPlay className="w-3 h-3" />
              Activate Wake Lock
            </button>
          ) : (
            <button
              type="button"
              onClick={releaseWakeLock}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              <FiPause className="w-3 h-3" />
              Release Wake Lock
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>• Prevents screen from turning off automatically</div>
          <div>• Useful for presentations or media playback</div>
          <div>• Released automatically when tab becomes hidden</div>
        </div>
      </div>
    </div>
  );
}

export default ScreenWakeLockPreview;

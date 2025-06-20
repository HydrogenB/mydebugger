/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Idle Panel Component - shows user and screen idle state
 */
import React, { useEffect, useState } from 'react';
import { MdPauseCircle, MdStop } from 'react-icons/md';

interface IdleDetectorLike extends EventTarget {
  start: (options: { threshold: number }) => Promise<void>;
  stop?: () => void;
  userState: 'active' | 'idle';
  screenState: 'locked' | 'unlocked';
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface IdlePanelProps {
  detector: IdleDetectorLike;
  onStop: () => void;
}

function IdlePanel({ detector, onStop }: IdlePanelProps) {
  const [userState, setUserState] = useState(detector.userState);
  const [screenState, setScreenState] = useState(detector.screenState);

  useEffect(() => {
    const handleChange = () => {
      setUserState(detector.userState);
      setScreenState(detector.screenState);
    };
    detector.addEventListener('change', handleChange);
    return () => {
      detector.removeEventListener('change', handleChange);
      detector.stop?.();
      onStop();
    };
  }, [detector, onStop]);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 text-center">
      <div className="flex items-center justify-center gap-2">
        <MdPauseCircle className="w-5 h-5 text-indigo-600" />
        <span className="font-medium text-indigo-800 dark:text-indigo-200">Idle Status</span>
        <button
          type="button"
          onClick={() => { detector.stop?.(); onStop(); }}
          className="ml-auto text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
        >
          <MdStop className="w-4 h-4" />
        </button>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        User: <span className="font-mono font-semibold">{userState}</span>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Screen: <span className="font-mono font-semibold">{screenState}</span>
      </div>
    </div>
  );
}

export default IdlePanel;

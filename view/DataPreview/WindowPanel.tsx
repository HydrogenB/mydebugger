/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Window Panel Component - show window open state
 */
import React, { useEffect, useState } from 'react';
import { MdOpenInNew, MdStop } from 'react-icons/md';

interface WindowPanelProps {
  win: Window;
  onClose: () => void;
}

function WindowPanel({ win, onClose }: WindowPanelProps) {
  const [closed, setClosed] = useState(win.closed);

  useEffect(() => {
    const interval = setInterval(() => {
      if (win.closed) {
        setClosed(true);
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (!win.closed) win.close();
      onClose();
    };
  }, [win, onClose]);

  const handleClose = () => {
    if (!win.closed) win.close();
    setClosed(true);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <MdOpenInNew className="w-5 h-5 text-indigo-600" />
        <span className="font-medium text-indigo-800 dark:text-indigo-200">Window State</span>
        {!closed && (
          <button
            type="button"
            onClick={handleClose}
            className="ml-auto text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
          >
            <MdStop className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {closed ? 'Window closed' : 'Window open'}
      </div>
    </div>
  );
}

export default WindowPanel;

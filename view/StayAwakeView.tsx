/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';

interface Props {
  enabled: boolean;
  supported: boolean;
  toggle: () => Promise<void>;
}

function StayAwakeView({ enabled, supported, toggle }: Props) {
  if (!supported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <p className="text-red-500 font-bold text-center px-4">Wake Lock not supported in this browser.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#111] text-white">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        className={`relative w-40 h-16 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          enabled ? 'bg-green-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-14 w-14 rounded-full bg-white shadow transition-transform duration-300 ${
            enabled ? 'translate-x-24' : 'translate-x-0'
          }`}
        />
      </button>
      <p className="mt-4 font-bold text-white text-lg">
        {enabled ? 'Stay Awake' : 'Allow Sleep'}
      </p>
    </div>
  );
}

export default StayAwakeView;

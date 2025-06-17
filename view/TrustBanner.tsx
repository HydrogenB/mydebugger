/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';

export function TrustBanner() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 py-4 text-center text-sm">
    <p className="flex flex-col sm:flex-row items-center justify-center gap-2">
      <span className="flex items-center gap-1">
        <span role="img" aria-label="brain">🧠</span>
        Trusted by 1,200+ developers
      </span>
      <span className="hidden sm:inline">|</span>
      <span className="flex items-center gap-1">
        <span role="img" aria-label="zap">⚡</span>
        Open Source
      </span>
      <span className="hidden sm:inline">|</span>
      <span className="flex items-center gap-1">
        <span role="img" aria-label="speech balloon">💬</span>
        Instant feedback welcome!
      </span>
    </p>
    <div className="mt-2 flex flex-wrap justify-center gap-3">
      <img
        src="https://img.shields.io/github/stars/HydrogenB/mydebugger?style=social"
        alt="GitHub stars"
      />
      <img
        src="https://img.shields.io/badge/Vercel-Ready-black?logo=vercel"
        alt="Vercel deploy"
      />
      <img
        src="https://img.shields.io/badge/SEO-100%25-green"
        alt="Lighthouse score"
      />
    </div>
  </div>
  );
}

export default TrustBanner;

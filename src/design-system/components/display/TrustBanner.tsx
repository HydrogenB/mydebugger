import React from 'react';

const TrustBanner: React.FC = () => {
  return (
    <div className="mt-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 p-4 border border-primary-100 dark:border-primary-800 flex items-center justify-between">
      <div className="text-sm text-primary-800 dark:text-primary-200">
        <strong>Trusted by 1,200+ developers</strong> to debug, encode, and validate web apps.
      </div>
      <a
        className="text-sm text-primary-700 dark:text-primary-300 hover:underline"
        href="https://github.com/HydrogenB/mydebugger"
        target="_blank"
        rel="noopener noreferrer"
      >
        Star on GitHub
      </a>
    </div>
  );
};

export default TrustBanner;



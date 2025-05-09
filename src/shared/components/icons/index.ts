import React from 'react';

/**
 * Icon component creator function
 * Creates an icon component with the provided SVG path
 */
const createIcon = (path: JSX.Element) => {
  return ({ className = '' }: { className?: string }) => (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
    >
      {path}
    </svg>
  );
};

// JWT Icon
export const JwtIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
);

// Sequence Diagram Icon
export const SequenceDiagramIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
);

// QR Code Icon
export const QrCodeIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM16 12a4 4 0 11-8 0 4 4 0 018 0z" />
);

// DNS Icon for DNS Lookup tool
export const DnsIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
);

// Headers Icon for HTTP Headers Analyzer
export const HeadersIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
);

// Formatters Icon for text formatters
export const FormattersIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
);

// Regex Icon for Regex Tester
export const RegexIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
);

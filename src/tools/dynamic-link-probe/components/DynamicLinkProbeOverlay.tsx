import React from 'react';

interface Props {
  trace: any;
}

export const DynamicLinkProbeOverlay: React.FC<Props> = ({ trace }) => {
  if (!trace) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-black/80 text-white px-3 py-2 text-xs max-w-sm shadow-lg">
      <div className="font-semibold mb-1">Dynamic Link Trace</div>
      <pre className="whitespace-pre-wrap break-words opacity-90">
        {typeof trace === 'string' ? trace : JSON.stringify(trace, null, 2)}
      </pre>
    </div>
  );
};

export default DynamicLinkProbeOverlay;



/**
 * © 2025 MyDebugger Contributors – MIT License
 */
/* eslint-disable react/jsx-props-no-spreading, react/require-default-props */
import React, { useState, useEffect } from 'react';

export interface PreviewIframeProps
  extends Omit<React.IframeHTMLAttributes<HTMLIFrameElement>, 'onLoad' | 'onError'> {
  /** Callback when preview blocked due to X-Frame-Options */
  onBlocked?: () => void;
  /** Callback when preview allowed */
  onAllowed?: () => void;
  /** Title for the iframe element */
  title?: string;
}

function PreviewIframe({ onBlocked, onAllowed, title = 'preview', ...rest }: PreviewIframeProps) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(false);
  }, [rest.src]);

  const handleError = () => {
    setBlocked(true);
    if (onBlocked) onBlocked();
  };

  const handleLoad = () => {
    if (onAllowed) onAllowed();
  };

  return (
    <>
      {!blocked && (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <iframe
          {...rest}
          title={title}
          sandbox=""
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {blocked && (
        <div className="p-3 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          X-Frame-Options prevents preview
        </div>
      )}
    </>
  );
}

export default PreviewIframe;

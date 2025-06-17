/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

const clsx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

interface Props {
  fullName: string;
  phone: string;
  email: string;
  organization: string;
  title: string;
  website: string;
  address: string;
  qrDataUrl: string;
  flipped: boolean;
  flip: (toBack?: boolean) => void;
  download: () => void;
  downloadQr: () => void;
  copyVcard: () => void;
  shareCard: () => void;
  onInteract: () => void;
}

export interface VirtualCardHeroHandle {
  showQr: () => void;
  root: HTMLDivElement | null;
}

const VirtualCardHero = forwardRef<VirtualCardHeroHandle, Props>(({ 
  fullName,
  phone,
  email,
  organization,
  title,
  website,
  address,
  qrDataUrl,
  flipped,
  flip,
  download,
  downloadQr,
  copyVcard,
  shareCard,
  onInteract,
}, ref) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const handleFlip = () => flip(!flipped);

  useImperativeHandle(ref, () => ({ showQr: () => flip(true), root: rootRef.current }));

  return (
    <div ref={rootRef} className="relative mx-auto my-6 w-72 h-96 [perspective:1000px]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => { handleFlip(); onInteract(); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { handleFlip(); onInteract(); }
        }}
        aria-label="Flip card"
        className={clsx(
          'absolute inset-0 [transform-style:preserve-3d]',
          'transition-transform duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
          'motion-reduce:transition-opacity motion-reduce:duration-300',
          flipped && 'rotate-y-180 motion-reduce:rotate-y-0',
        )}
      >
        <div
          className={clsx(
            'absolute inset-0 flex flex-col items-center justify-center rounded-2xl shadow-xl',
            'bg-white dark:bg-gray-800 [backface-visibility:hidden] motion-reduce:[backface-visibility:visible]',
            'transition-opacity duration-300',
            flipped && 'opacity-0 motion-reduce:opacity-100',
          )}
        >
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 shadow mb-4" />
          <p className="text-xl font-semibold text-gray-800 dark:text-white">{fullName || 'Your Name'}</p>
          {title && <p className="text-gray-600 dark:text-gray-300 text-sm">{title}</p>}
          {organization && <p className="text-gray-600 dark:text-gray-300 text-sm">{organization}</p>}
          {phone && <p className="text-gray-600 dark:text-gray-300 text-sm">{phone}</p>}
          {email && <p className="text-gray-600 dark:text-gray-300 text-sm">{email}</p>}
          {website && (
            <a href={website} className="text-primary-600 dark:text-primary-400 text-sm" target="_blank" rel="noopener noreferrer">
              {website}
            </a>
          )}
          {address && <p className="text-gray-600 dark:text-gray-300 text-sm text-center">{address}</p>}
          <div className="flex gap-3 mt-4">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded focus:outline-none"
              >
                📞 Call
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded focus:outline-none"
              >
                ✉️ Email
              </a>
            )}
            <button
              type="button"
              onClick={() => { shareCard(); onInteract(); }}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded focus:outline-none"
            >
              🔗 Share
            </button>
          </div>
        </div>
        <div
          className={clsx(
            'absolute inset-0 flex flex-col items-center justify-center rounded-2xl shadow-xl rotate-y-180',
            'bg-white dark:bg-gray-800 [backface-visibility:hidden] motion-reduce:[backface-visibility:visible]',
            'transition-opacity duration-300',
            flipped ? 'opacity-100' : 'opacity-0 motion-reduce:opacity-100',
          )}
        >
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR code" aria-live="polite" className="w-60 h-60" />
          ) : (
            <div className="w-60 h-60 bg-gray-200 dark:bg-gray-700" />
          )}
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Scan to save</p>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => { download(); onInteract(); }}
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded"
            >
              ⬇ Save Contact
            </button>
            <button
              type="button"
              onClick={() => { copyVcard(); onInteract(); }}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200"
            >
              📋 Copy Info
            </button>
            <button
              type="button"
              onClick={() => { downloadQr(); onInteract(); }}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200"
            >
              💾 QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

VirtualCardHero.displayName = 'VirtualCardHero';

export default VirtualCardHero;

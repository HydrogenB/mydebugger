/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useEffect, useState } from 'react';

interface Props {
  download: () => void;
  shareCard: () => void;
  showQr: () => void;
}

export default function VirtualCardActions({ download, shareCard, showQr }: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      setHidden(current > lastY);
      lastY = current;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-4 inset-x-0 flex justify-center gap-3 md:hidden transition-transform duration-300 ${hidden ? 'translate-y-24 opacity-0' : 'translate-y-0'}`}
    >
      <button
        type="button"
        onClick={download}
        className="px-4 py-2 rounded-full bg-primary-600 text-white shadow"
      >
        Save to Contacts
      </button>
      <button
        type="button"
        onClick={shareCard}
        className="px-4 py-2 rounded-full bg-primary-600 text-white shadow"
      >
        Share My Card
      </button>
      <button
        type="button"
        onClick={showQr}
        className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 shadow"
      >
        Show QR Again
      </button>
    </div>
  );
}

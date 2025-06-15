/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';

interface Props {
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  vcard: string;
  qrDataUrl: string;
  shareUrl: string;
  showRaw: boolean;
  toggleRaw: () => void;
  download: () => void;
  copyLink: () => void;
}

export function VirtualCardView({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  vcard,
  qrDataUrl,
  shareUrl,
  showRaw,
  toggleRaw,
  download,
  copyLink,
}: Props) {
  return (
    <div className={TOOL_PANEL_CLASS}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Virtual Name Card</h2>
      <div className="space-y-4">
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="full-name" className="block mb-1 text-sm font-medium">Full Name</label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700"
          />
        </div>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="phone" className="block mb-1 text-sm font-medium">Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700"
          />
        </div>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="email" className="block mb-1 text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={download} className="px-3 py-1 bg-blue-500 text-white rounded">Download VCF</button>
          <button type="button" onClick={copyLink} className="px-3 py-1 bg-blue-500 text-white rounded">Copy Link</button>
          <button type="button" onClick={toggleRaw} className="px-3 py-1 bg-gray-300 rounded dark:bg-gray-600 dark:text-white">{showRaw ? 'Hide VCF' : 'Show VCF'}</button>
        </div>
        {showRaw && (
          <textarea className="w-full h-32 p-2 border rounded dark:bg-gray-700" readOnly value={vcard} />
        )}
        {qrDataUrl && (
          <div className="mt-4 text-center">
            <img src={qrDataUrl} alt="QR code" className="inline-block" />
            <p className="mt-2 break-all text-sm">{shareUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualCardView;

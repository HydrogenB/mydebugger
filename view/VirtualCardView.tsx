/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import VirtualCardHero, { VirtualCardHeroHandle } from './VirtualCardHero';
import VirtualCardActions from './VirtualCardActions';

interface Props {
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  organization: string;
  setOrganization: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  vcard: string;
  qrDataUrl: string;
  showRaw: boolean;
  toggleRaw: () => void;
  download: () => void;
  downloadImage: () => void;
  copyLink: () => void;
  copyVcard: () => void;
  downloadQr: () => void;
  shareCard: () => void;
  isFlipped: boolean;
  flip: (toBack?: boolean) => void;
  toastMessage: string;
  cancelFlip: () => void;
  viewOnly: boolean;
  heroRef: React.RefObject<VirtualCardHeroHandle>;
}

export function VirtualCardView({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  organization,
  setOrganization,
  title,
  setTitle,
  website,
  setWebsite,
  address,
  setAddress,
  vcard,
  qrDataUrl,
  showRaw,
  toggleRaw,
  download,
  downloadImage,
  copyLink,
  copyVcard,
  shareCard,
  downloadQr,
  isFlipped,
  flip,
  toastMessage,
  cancelFlip,
  viewOnly,
  heroRef,
}: Props) {
  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Virtual Name Card</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
        {!viewOnly && (
        <>
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
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="org" className="block mb-1 text-sm font-medium">Organization</label>
          <input id="org" type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700" />
        </div>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="title" className="block mb-1 text-sm font-medium">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700" />
        </div>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="website" className="block mb-1 text-sm font-medium">Website</label>
          <input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700" />
        </div>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="addr" className="block mb-1 text-sm font-medium">Address</label>
          <input id="addr" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700" />
        </div>
</>
)}
        <div className="flex gap-2">
          <button type="button" onClick={download} className="px-3 py-1 bg-blue-500 text-white rounded">Download VCF</button>
          {!viewOnly && (
            <button type="button" onClick={copyLink} className="px-3 py-1 bg-blue-500 text-white rounded">Copy Link</button>
          )}
          {!viewOnly && (
            <button type="button" onClick={downloadImage} className="px-3 py-1 bg-blue-500 text-white rounded">Download PNG</button>
          )}
          <button type="button" onClick={toggleRaw} className="px-3 py-1 bg-gray-300 rounded dark:bg-gray-600 dark:text-white">{showRaw ? 'Hide VCF' : 'Show VCF'}</button>
        </div>
        {showRaw && (
          <textarea className="w-full h-32 p-2 border rounded dark:bg-gray-700" readOnly value={vcard} />
        )}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
            {toastMessage}
          </div>
        )}
      </div>
        <div className="flex justify-center lg:justify-end">
          <div className="transition-opacity duration-300 delay-150 max-w-sm">
            <VirtualCardHero
              ref={heroRef}
              fullName={fullName}
              phone={phone}
              email={email}
              organization={organization}
              title={title}
              website={website}
              address={address}
              qrDataUrl={qrDataUrl}
              flipped={isFlipped}
              flip={flip}
              download={download}
              downloadQr={downloadQr}
              copyVcard={copyVcard}
              onInteract={cancelFlip}
            />
            <VirtualCardActions
              download={download}
              shareCard={shareCard}
              showQr={() => flip(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualCardView;

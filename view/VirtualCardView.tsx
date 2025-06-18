/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  Star,
  Zap,
} from 'lucide-react';
import VirtualCardHero, { VirtualCardHeroHandle } from './VirtualCardHero';
import VirtualCardActions from './VirtualCardActions';
import AuroraBackground from './AuroraBackground';
import AuroraInput from './AuroraInput';

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
    <div className="relative min-h-screen px-4 py-10 overflow-hidden">
      <AuroraBackground />
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-center text-white"
      >
        Virtual Name Card
      </motion.h2>
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {!viewOnly && (
            <>
              <AuroraInput label="Full Name" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" icon={<Star className="w-4 h-4" />} />
              <AuroraInput label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1" icon={<Phone className="w-4 h-4" />} />
              <AuroraInput label="Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" icon={<Mail className="w-4 h-4" />} />
              <AuroraInput label="Organization" name="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Org" icon={<Zap className="w-4 h-4" />} />
              <AuroraInput label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="CEO" icon={<Briefcase className="w-4 h-4" />} />
              <AuroraInput label="Website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="example.com" icon={<Globe className="w-4 h-4" />} />
              <AuroraInput label="Address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 street" icon={<MapPin className="w-4 h-4" />} />
            </>
          )}
          <div className="flex flex-wrap gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={download} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
              Download VCF
            </motion.button>
            {!viewOnly && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyLink} className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-xl">
                Copy Link
              </motion.button>
            )}
            {!viewOnly && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={downloadImage} className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-xl">
                Download PNG
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleRaw} className="px-4 py-2 bg-gray-300 rounded dark:bg-gray-600 dark:text-white">
              {showRaw ? 'Hide VCF' : 'Show VCF'}
            </motion.button>
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
            <VirtualCardActions download={download} shareCard={shareCard} showQr={() => flip(true)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualCardView;

/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from 'react';
import {
  ContactInfo,
  generateVCard,
  encodeContactData,
  decodeContactData,
} from '../model/virtualCard';

let qrImport: Promise<typeof import('qrcode')> | null = null;
const loadQRCode = async () => {
  if (!qrImport) qrImport = import('qrcode');
  return qrImport;
};

export const useVirtualCard = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vcard, setVcard] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  const updateOutputs = async (info: ContactInfo) => {
    const card = generateVCard(info);
    setVcard(card);
    try {
      const QRCode = await loadQRCode();
      setQrDataUrl(await QRCode.toDataURL(card));
    } catch {
      setQrDataUrl('');
    }
    const encoded = encodeContactData(info);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    setShareUrl(url);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      const decoded = decodeContactData(data);
      if (decoded) {
        setFullName(decoded.fullName || '');
        setPhone(decoded.phone || '');
        setEmail(decoded.email || '');
      }
    }
  }, []);

  useEffect(() => {
    const info: ContactInfo = { fullName, phone, email };
    if (fullName || phone || email) {
      updateOutputs(info);
    } else {
      setVcard('');
      setQrDataUrl('');
      setShareUrl('');
    }
  }, [fullName, phone, email]);

  const download = () => {
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contact.vcf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyLink = async () => {
    if (shareUrl) await navigator.clipboard.writeText(shareUrl);
  };

  const toggleRaw = () => setShowRaw((s) => !s);

  return {
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
  };
};

export default useVirtualCard;

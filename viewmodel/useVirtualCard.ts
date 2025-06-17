/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useRef, useState } from 'react';
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const flipTimer = useRef<number>();

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

  useEffect(() => {
    if (!toastMessage) return undefined;
    const t = window.setTimeout(() => setToastMessage(''), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const download = () => {
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contact.vcf';
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage('Contact saved');
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'qr.png';
    link.click();
    setToastMessage('QR saved');
  };
  const copyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage('Link copied');
    }
  };

  const copyVcard = async () => {
    if (vcard) {
      await navigator.clipboard.writeText(vcard);
      setToastMessage('Contact copied');
    }
  };

  const shareCard = async () => {
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({ url: shareUrl });
        return;
      } catch {
        // fall back to copy
      }
    }
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage('Link copied');
    }
  };

  const flip = (toBack = !isFlipped) => {
    setIsFlipped(toBack);
    if (toBack) {
      if (flipTimer.current) clearTimeout(flipTimer.current);
      flipTimer.current = window.setTimeout(() => setIsFlipped(false), 10000);
    } else if (flipTimer.current) {
      clearTimeout(flipTimer.current);
    }
  };

  const cancelFlip = () => {
    if (flipTimer.current) clearTimeout(flipTimer.current);
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
    downloadQr,
    copyLink,
    copyVcard,
    shareCard,
    isFlipped,
    flip,
    cancelFlip,
    toastMessage,
  };
};

export default useVirtualCard;

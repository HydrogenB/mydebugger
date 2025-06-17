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
import { VirtualCardHeroHandle } from '../view/VirtualCardHero';

let qrImport: Promise<typeof import('qrcode')> | null = null;
const loadQRCode = async () => {
  if (!qrImport) qrImport = import('qrcode');
  return qrImport;
};

export const useVirtualCard = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [title, setTitle] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [vcard, setVcard] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [viewOnly, setViewOnly] = useState(false);
  const heroRef = useRef<VirtualCardHeroHandle | null>(null);
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
        setOrganization(decoded.organization || '');
        setTitle(decoded.title || '');
        setWebsite(decoded.website || '');
        setAddress(decoded.address || '');
        setViewOnly(true);
      }
    }
  }, []);

  useEffect(() => {
    const info: ContactInfo = {
      fullName,
      phone,
      email,
      organization,
      title,
      website,
      address,
    };
    if (fullName || phone || email || organization || title || website || address) {
      updateOutputs(info);
    } else {
      setVcard('');
      setQrDataUrl('');
      setShareUrl('');
    }
  }, [fullName, phone, email, organization, title, website, address]);

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

  const downloadImage = async () => {
    if (!heroRef.current?.root) return;
    const htmlToImage = await import('html-to-image');
    const url = await htmlToImage.toPng(heroRef.current.root);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'card.png';
    link.click();
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
    shareUrl,
    showRaw,
    toggleRaw,
    download,
    downloadQr,
    downloadImage,
    copyLink,
    copyVcard,
    shareCard,
    isFlipped,
    flip,
    cancelFlip,
    toastMessage,
    viewOnly,
    heroRef,
  };
};

export default useVirtualCard;

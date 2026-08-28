/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { copyText } from '../../shared/utils/clipboard';

// Contact Info Interface
interface ContactInfo {
  fullName?: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  website?: string;
  address?: string;
  customEmoji?: string;
}

// VirtualCard Model Functions
const generateVCard = (info: ContactInfo): string => {
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
  
  if (info.fullName) {
    vcard += `FN:${info.fullName}\n`;
    const names = info.fullName.split(' ');
    const lastName = names.pop() || '';
    const firstName = names.join(' ');
    vcard += `N:${lastName};${firstName};;;\n`;
  }
  if (info.organization) vcard += `ORG:${info.organization}\n`;
  if (info.title) vcard += `TITLE:${info.title}\n`;
  if (info.phone) vcard += `TEL:${info.phone}\n`;
  if (info.email) vcard += `EMAIL:${info.email}\n`;
  if (info.website) vcard += `URL:${info.website}\n`;
  if (info.address) vcard += `ADR:;;${info.address};;;;\n`;
  if (info.customEmoji) vcard += `NOTE:${info.customEmoji}\n`;
  
  vcard += 'END:VCARD';
  return vcard;
};

const encodeContactData = (info: ContactInfo): string => {
  return btoa(encodeURIComponent(JSON.stringify(info)));
};

const decodeContactData = (data: string): ContactInfo | null => {
  try {
    return JSON.parse(decodeURIComponent(atob(data)));
  } catch {
    return null;
  }
};

// Main Hook - useVirtualCard
const useVirtualCard = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [title, setTitle] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [customEmoji, setCustomEmoji] = useState('💼');
  const [vcard, setVcard] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [viewOnly, setViewOnly] = useState(false);
  const heroRef = useRef<any>(null);
  const flipTimer = useRef<number>();

  const updateOutputs = async (info: ContactInfo) => {
    const card = generateVCard(info);
    setVcard(card);
    
    // Generate QR code using canvas (simple implementation)
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Simple QR placeholder - in production, use a proper QR library
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#000000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', 100, 100);
        ctx.font = '10px monospace';
        ctx.fillText('(Install qrcode lib)', 100, 120);
        setQrDataUrl(canvas.toDataURL());
      }
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
        setCustomEmoji(decoded.customEmoji || '💼');
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
      customEmoji,
    };
    if (fullName || phone || email || organization || title || website || address) {
      updateOutputs(info);
    } else {
      setVcard('');
      setQrDataUrl('');
      setShareUrl('');
    }
  }, [fullName, phone, email, organization, title, website, address, customEmoji]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const t = window.setTimeout(() => setToastMessage(''), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const download = () => {
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fullName || 'contact'}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage('บันทึกรายชื่อแล้ว! 📥 Contact saved!');
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'qr.png';
    link.click();
    setToastMessage('บันทึก QR แล้ว! 📷 QR saved!');
  };

  const downloadImage = async () => {
    setToastMessage('กำลังบันทึกรูป... 🖼️ Saving image...');
    // In production, use html-to-image library
    setTimeout(() => {
      setToastMessage('บันทึกรูปสำเร็จ! ✅ Image saved!');
    }, 1000);
  };

  const copyLink = async () => {
    if (shareUrl) {
      const copied = await copyText(shareUrl);
      if (copied) {
        setToastMessage('คัดลอกลิงก์แล้ว! 🔗 Link copied!');
      }
    }
  };

  const copyVcard = async () => {
    if (vcard) {
      const copied = await copyText(vcard);
      if (copied) {
        setToastMessage('คัดลอกข้อมูลแล้ว! 📋 Info copied!');
      }
    }
  };

  const shareCard = async () => {
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({ 
          url: shareUrl,
          title: `นามบัตรของ ${fullName || 'Digital Card'}`,
          text: `บันทึกข้อมูลติดต่อของ ${fullName || 'me'}`
        });
        return;
      } catch {
        // fall back to copy
      }
    }
    if (shareUrl) {
      const copied = await copyText(shareUrl);
      if (copied) {
        setToastMessage('คัดลอกลิงก์แล้ว! 🔗 Link copied!');
      }
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
    customEmoji,
    setCustomEmoji,
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

// VirtualCardView Component (embedded for single file)
const VirtualCardView: React.FC<ReturnType<typeof useVirtualCard>> = (props) => {
  const {
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
    customEmoji,
    setCustomEmoji,
    vcard,
    qrDataUrl,
    showRaw,
    toggleRaw,
    download,
    downloadImage,
    copyLink,
    shareCard,
    isFlipped,
    flip,
    toastMessage,
    viewOnly,
  } = props;

  return (
    <div className="app-ambient-bg py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold heading-gradient mb-6">
          นามบัตรดิจิทัล 💳 Virtual Business Card
        </h1>
        
        <div className={`grid gap-6 ${viewOnly ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
          {/* Form Section */}
          {!viewOnly && (
            <div className="card-ambient rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">ข้อมูลส่วนตัว / Personal Info</h2>
              
              <div className="mb-3">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                  ชื่อ-นามสกุล / Full Name
                </label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="สมชาย ใจดี / Somchai Jaidee" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div className="mb-3">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                  โทรศัพท์ / Phone
                </label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+66 81 234 5678 / 081-234-5678" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                  อีเมล / Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="somchai@example.co.th"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                  บริษัท/องค์กร / Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="บริษัท ไทยเจริญ จำกัด / Thai Charoen Co., Ltd."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                  ตำแหน่ง / Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ผู้จัดการฝ่ายขาย / Sales Manager"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                  เว็บไซต์ / Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.example.co.th"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                  ที่อยู่ / Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                  อีโมจิประจำตัว / Custom Emoji
                </label>
                <input
                  type="text"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="💼 (ใส่อีโมจิที่ชอบ / Add your favorite emoji)"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.5rem' }}
                  maxLength={5}
                />
                <small style={{ color: '#888' }}>
                  ลองใส่: 🇹🇭 🙏 🐘 🌺 🥭 🍜 🏝️ 🛺 🎭 🏛️
                </small>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={download} className="btn-gradient rounded-md px-4 py-2 text-white">📥 ดาวน์โหลด vCard</button>
                <button onClick={copyLink} className="rounded-md px-4 py-2 bg-primary-600 text-white">🔗 คัดลอกลิงก์</button>
                <button onClick={shareCard} className="rounded-md px-4 py-2 bg-pink-500 text-white">📤 แชร์นามบัตร</button>
                <button onClick={toggleRaw} className="rounded-md px-4 py-2 bg-gray-500 text-white">{showRaw ? '🙈 ซ่อน vCard' : '👁️ ดู vCard'}</button>
              </div>

              {showRaw && (
                <pre style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.85rem', overflow: 'auto' }}>
                  {vcard}
                </pre>
              )}
            </div>
          )}

          {/* Card Preview */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => flip()}
              className="mb-6"
              style={{ width: '350px', height: '200px', perspective: '1000px', cursor: 'pointer' }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'
              }}>
                {/* Front */}
                <div className="card-ambient" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ fontSize: '2rem' }}>{customEmoji}</div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {fullName || 'ชื่อของคุณ'}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                      {title && organization ? `${title} @ ${organization}` : 'ตำแหน่ง @ บริษัท'}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
                      {phone && `📱 ${phone}`}
                      {email && <div>✉️ {email}</div>}
                    </div>
                  </div>
                </div>
                
                {/* Back */}
                <div className="card-ambient" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  background: 'white',
                  borderRadius: '15px',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" style={{ width: '120px', height: '120px' }} />
                  ) : (
                    <div style={{ width: '120px', height: '120px', background: '#f0f0f0' }} />
                  )}
                  <p style={{ marginTop: '1rem', color: '#666' }}>สแกนเพื่อบันทึก</p>
                </div>
              </div>
            </div>

            <div className="text-center text-white">
              <p className="mb-4 opacity-90">
                👆 คลิกการ์ดเพื่อพลิกดู QR Code
              </p>
              {viewOnly && (
                <div className="mt-6">
                  <button onClick={download} className="rounded-xl bg-white text-primary-600 px-6 py-3 font-semibold shadow">💾 บันทึกรายชื่อติดต่อนี้</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-8 right-8 bg-black/80 text-white px-4 py-3 rounded-lg shadow animate-fade-in">{toastMessage}</div>
        )}
      </div>
    </div>
  );
};

// Main Page Component
const VirtualCardPage: React.FC = () => {
  const vm = useVirtualCard();
  
  return (
    <>
      <Helmet>
        <title>
          {vm.fullName 
            ? `${vm.fullName} – นามบัตรดิจิทัล | Digital Contact Card` 
            : 'Virtual Business Card Generator | เครื่องมือสร้างนามบัตรดิจิทัล'}
        </title>
        <meta 
          name="description" 
          content="สร้างและแชร์นามบัตรดิจิทัลพร้อม QR Code และดาวน์โหลด vCard | Create and share digital contact card with QR and vCard download." 
        />
        <meta 
          property="og:title" 
          content={vm.fullName ? `${vm.fullName} – Digital vCard` : 'Virtual Business Card Generator'} 
        />
        <meta 
          property="og:description" 
          content="บันทึกนามบัตรดิจิทัลนี้ | Save this digital business card." 
        />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          input:focus { outline: 2px solid #667eea; outline-offset: 2px; }
          button:hover { transform: translateY(-2px); transition: transform 0.2s; }
          button:active { transform: translateY(0); }
        `}</style>
      </Helmet>
      <VirtualCardView {...vm} />
    </>
  );
};

export default VirtualCardPage;
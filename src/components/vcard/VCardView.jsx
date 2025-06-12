import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { LoadingSpinner } from '../../design-system/components/feedback';

const SOCIAL_ICONS = {
  linkedin: '/asset/icons/linkedin.svg',
  twitter: '/asset/icons/twitter.svg',
  facebook: '/asset/icons/facebook.svg',
  instagram: '/asset/icons/instagram.svg',
  github: '/asset/icons/github.svg',
  youtube: '/asset/icons/youtube.svg',
  tiktok: '/asset/icons/tiktok.svg',
  whatsapp: '/asset/icons/whatsapp.svg',
  snapchat: '/asset/icons/snapchat.svg',
  email: '/asset/icons/email.svg',
  website: '/asset/icons/website.svg',
  phone: '/asset/icons/phone.svg',
  telegram: '/asset/icons/telegram.svg',
  discord: '/asset/icons/discord.svg',
  default: '/asset/icons/link.svg',
};

const VCardView = ({ username }) => {
  const [vcard, setVcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [showQR, setShowQR] = useState(false);
  const [donationVisible, setDonationVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchVCard = async () => {
      try {
        const response = await fetch(`/api/vcard/${username}`);
        if (!response.ok) {
          throw new Error('Failed to load VCard');
        }
        const data = await response.json();
        setVcard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVCard();
  }, [username]);

  // Track click events
  const trackClick = async (linkType) => {
    try {
      await fetch('/api/vcard/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          trackingType: 'click',
          linkType,
        }),
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  // Download VCard file
  const downloadVCard = () => {
    if (!vcard) return;
    
    const vcardContent = generateVCardContent();
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vcard.displayName.replace(' ', '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Track download event
    fetch('/api/vcard/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        trackingType: 'contact_saved',
      }),
    }).catch(error => {
      console.error('Failed to track contact save:', error);
    });
  };
  
  const generateVCardContent = () => {
    const { displayName, title, company, email, phone, website, address } = vcard;
    
    let content = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${displayName || ''}`,
      `N:${displayName?.split(' ').pop() || ''};${displayName?.split(' ').shift() || ''};;;`,
    ];
    
    if (title) content.push(`TITLE:${title}`);
    if (company) content.push(`ORG:${company}`);
    if (email) content.push(`EMAIL;type=INTERNET;type=WORK:${email}`);
    if (phone) content.push(`TEL;type=CELL:${phone}`);
    if (website) content.push(`URL:${website}`);
    if (address) content.push(`ADR;type=WORK:;;${address};;;;`);
    
    if (vcard.profileImage) {
      content.push(`PHOTO;VALUE=URL:${new URL(vcard.profileImage, window.location.origin).href}`);
    }
    
    content.push('END:VCARD');
    return content.join('\r\n');
  };

  // Generate QR Code
  const generateQRCode = () => {
    setShowQR(true);
    
    // Track QR code generation
    fetch('/api/vcard/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        trackingType: 'qr_download',
      }),
    }).catch(error => {
      console.error('Failed to track QR generation:', error);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !vcard) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">{error || 'Failed to load VCard'}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Set up theme colors based on vcard appearance
  const appearance = vcard.appearances;
  const primaryColor = appearance.primary || '#3B82F6';
  const secondaryColor = appearance.secondary || '#10B981';
  const theme = appearance.theme || 'light';
  const font = appearance.font || 'Inter';
  
  const themeClass = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

  return (
    <div 
      className={`min-h-screen ${themeClass}`}
      style={{ fontFamily: font }}
    >
      {/* Cover image */}
      {vcard.coverImage && (
        <div 
          className="w-full h-48 bg-center bg-cover"
          style={{ backgroundImage: `url(${vcard.coverImage})` }}
        />
      )}

      {/* Profile section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="relative -mt-16 mb-8 flex justify-center">
          {vcard.profileImage ? (
            <img 
              src={vcard.profileImage} 
              alt={vcard.displayName} 
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
            />
          ) : (
            <div 
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              {vcard.displayName?.charAt(0) || '?'}
            </div>
          )}
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{vcard.displayName}</h1>
          {vcard.title && <h2 className="text-lg text-gray-600 dark:text-gray-300">{vcard.title}</h2>}
          {vcard.company && <div className="text-sm text-gray-500 dark:text-gray-400">{vcard.company}</div>}
          
          {vcard.bio && (
            <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-md mx-auto">
              {vcard.bio}
            </p>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            variant="primary" 
            onClick={downloadVCard}
            style={{ backgroundColor: primaryColor }}
          >
            Save Contact
          </Button>
          
          <Button 
            variant="secondary"
            onClick={generateQRCode} 
            style={{ backgroundColor: secondaryColor }}
          >
            Share QR
          </Button>
        </div>
        
        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowQR(false)}>
            <div className={`max-w-md w-full ${TOOL_PANEL_CLASS}`} onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
              <div className="mb-4 flex justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                  alt="QR Code" 
                  className="border rounded"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowQR(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Contact information cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {vcard.phone && (
            <a 
              href={`tel:${vcard.phone}`} 
              className={`flex items-center p-4 ${TOOL_PANEL_CLASS} hover:shadow-md transition`}
              onClick={() => trackClick('phone')}
            >
              <img src={SOCIAL_ICONS.phone} alt="Phone" className="w-6 h-6 mr-3" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                <div className="font-medium">{vcard.phone}</div>
              </div>
            </a>
          )}
          
          {vcard.email && (
            <a 
              href={`mailto:${vcard.email}`}
              className={`flex items-center p-4 ${TOOL_PANEL_CLASS} hover:shadow-md transition`}
              onClick={() => trackClick('email')}
            >
              <img src={SOCIAL_ICONS.email} alt="Email" className="w-6 h-6 mr-3" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                <div className="font-medium">{vcard.email}</div>
              </div>
            </a>
          )}
          
          {vcard.website && (
            <a 
              href={vcard.website.startsWith('http') ? vcard.website : `https://${vcard.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center p-4 ${TOOL_PANEL_CLASS} hover:shadow-md transition`}
              onClick={() => trackClick('website')}
            >
              <img src={SOCIAL_ICONS.website} alt="Website" className="w-6 h-6 mr-3" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Website</div>
                <div className="font-medium">{vcard.website}</div>
              </div>
            </a>
          )}
          
          {vcard.whatsapp && (
            <a 
              href={`https://wa.me/${vcard.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center p-4 ${TOOL_PANEL_CLASS} hover:shadow-md transition`}
              onClick={() => trackClick('whatsapp')}
            >
              <img src={SOCIAL_ICONS.whatsapp} alt="WhatsApp" className="w-6 h-6 mr-3" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">WhatsApp</div>
                <div className="font-medium">{vcard.whatsapp}</div>
              </div>
            </a>
          )}
        </div>
        
        {/* Tabs for sections */}
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setActiveSection('profile')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeSection === 'profile' 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              style={{ borderColor: primaryColor }}
            >
              Profile
            </button>
            
            {vcard.socialLinks?.length > 0 && (
              <button
                onClick={() => setActiveSection('social')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeSection === 'social' 
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                style={{ borderColor: primaryColor }}
              >
                Social
              </button>
            )}
            
            {vcard.skills?.length > 0 && (
              <button
                onClick={() => setActiveSection('skills')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeSection === 'skills' 
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                style={{ borderColor: primaryColor }}
              >
                Skills
              </button>
            )}
            
            {vcard.services?.length > 0 && (
              <button
                onClick={() => setActiveSection('services')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeSection === 'services' 
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                style={{ borderColor: primaryColor }}
              >
                Services
              </button>
            )}
            
            {vcard.portfolio?.length > 0 && (
              <button
                onClick={() => setActiveSection('portfolio')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeSection === 'portfolio' 
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                style={{ borderColor: primaryColor }}
              >
                Portfolio
              </button>
            )}
            
            {vcard.testimonials?.length > 0 && (
              <button
                onClick={() => setActiveSection('testimonials')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeSection === 'testimonials' 
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                style={{ borderColor: primaryColor }}
              >
                Testimonials
              </button>
            )}
          </div>
        </div>
        
        {/* Donation banner (dismissible) */}
        {donationVisible && (
          <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm">
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-yellow-800 font-medium mb-1">Support This Project</p>
                <p className="text-yellow-700">
                  This VCard service is provided for free. If you find it useful, please consider supporting the developer!
                </p>
                <a 
                  href="https://buymeacoffee.com/jiradbirdp" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-2 inline-flex items-center text-yellow-800 hover:text-yellow-900 font-medium"
                  onClick={() => trackClick('donation_banner')}
                >
                  Buy me a coffee ☕
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              <button
                onClick={() => setDonationVisible(false)}
                className="text-yellow-500 hover:text-yellow-700 flex-shrink-0 ml-2"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Active section content */}
        <div className="py-4">
          {activeSection === 'profile' && (
            <div className="space-y-4">
              {vcard.customLinks?.length > 0 && (
                <div className="space-y-3">
                  {vcard.customLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url?.startsWith('http') ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block p-4 ${TOOL_PANEL_CLASS} text-center hover:shadow-md transition`}
                      onClick={() => trackClick(`custom_${link.title}`)}
                      style={{ border: `1px solid ${primaryColor}` }}
                    >
                      <span className="flex items-center justify-center">
                        {link.icon && (
                          <img src={link.icon} alt={link.title} className="w-5 h-5 mr-2" />
                        )}
                        <span>{link.title}</span>
                      </span>
                    </a>
                  ))}
                </div>
              )}
              
              {/* Show donation button in profile section */}
              <a
                href="https://buymeacoffee.com/jiradbirdp"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl shadow text-center hover:shadow-md transition mt-4"
                onClick={() => trackClick('donate_button')}
              >
                <span className="flex items-center justify-center text-yellow-800 dark:text-yellow-200">
                  <span className="mr-2">☕</span>
                  <span>Buy me a coffee</span>
                </span>
              </a>
            </div>
          )}
          
          {activeSection === 'social' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {vcard.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url?.startsWith('http') ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center p-4 ${TOOL_PANEL_CLASS} hover:shadow-md transition`}
                  onClick={() => trackClick(`social_${link.platform}`)}
                >
                  <img 
                    src={SOCIAL_ICONS[link.platform] || SOCIAL_ICONS.default} 
                    alt={link.platform} 
                    className="w-8 h-8 mb-2"
                  />
                  <span className="text-sm capitalize">{link.platform}</span>
                </a>
              ))}
            </div>
          )}
          
          {activeSection === 'skills' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {vcard.skills.map((skill) => (
                <div 
                  key={skill.id}
                  className={`p-3 ${TOOL_PANEL_CLASS} text-center`}
                >
                  {skill.name}
                </div>
              ))}
            </div>
          )}
          
          {activeSection === 'services' && (
            <div className="space-y-4">
              {vcard.services.map((service) => (
                <div 
                  key={service.id}
                  className={`p-4 ${TOOL_PANEL_CLASS}`}
                >
                  <div className="flex items-start">
                    {service.icon && (
                      <img 
                        src={service.icon} 
                        alt={service.title} 
                        className="w-8 h-8 mr-3 mt-1"
                      />
                    )}
                    <div>
                      <h3 className="font-bold mb-1">{service.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeSection === 'portfolio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
              {vcard.portfolio.map((item) => (
                <div 
                  key={item.id}
                  className={`${TOOL_PANEL_CLASS} overflow-hidden`}
                >
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/asset/icons/image-placeholder.svg';
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {item.description}
                      </p>
                    )}
                    {item.link && (
                      <a
                        href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium"
                        style={{ color: primaryColor }}
                        onClick={() => trackClick(`portfolio_${item.title}`)}
                      >
                        View Project
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeSection === 'testimonials' && (
            <div className="space-y-4">
              {vcard.testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className={`p-4 ${TOOL_PANEL_CLASS}`}
                >
                  <div className="flex">
                    {testimonial.avatar ? (
                      <img 
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/asset/icons/user-placeholder.svg';
                        }}
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full mr-4 flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      {testimonial.position && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {testimonial.position}
                        </div>
                      )}
                      <div className="mt-2 text-sm italic text-gray-600 dark:text-gray-300">
                        "{testimonial.content}"
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-0">
            {new Date().getFullYear()} © {vcard.displayName}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <a 
              href="https://buymeacoffee.com/jiradbirdp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
              onClick={() => trackClick('footer_donate')}
            >
              ☕ Support Developer
            </a>
            <a 
              href="https://mydebugger.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              Powered by MyDebugger
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VCardView;

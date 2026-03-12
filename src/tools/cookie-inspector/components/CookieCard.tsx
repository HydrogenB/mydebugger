/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * CookieCard - Mobile-first card component for displaying individual cookie details
 * Optimized for touch interactions and small screens
 */
import React, { useState, useMemo } from 'react';
import { CookieInfo } from '../lib/cookies';

interface CookieCardProps {
  cookie: CookieInfo;
  onCopy: (text: string, label: string) => void;
  onToggleExpand: (name: string) => void;
  isExpanded: boolean;
}

/**
 * Calculate time remaining until cookie expires
 */
const getTimeRemaining = (expires?: number): string | null => {
  if (!expires) return 'Session';
  
  const now = Date.now();
  const diff = expires * 1000 - now;
  
  if (diff <= 0) return 'Expired';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return '<1m';
};

/**
 * Check if cookie is expiring soon (within 1 hour)
 */
const isExpiringSoon = (expires?: number): boolean => {
  if (!expires) return false;
  const diff = expires * 1000 - Date.now();
  return diff > 0 && diff < 3600000; // 1 hour in ms
};

/**
 * Determine cookie category based on name patterns
 */
const getCookieCategory = (name: string): { icon: string; label: string; color: string } => {
  // Authentication/Session cookies
  if (/session|auth|token|jwt|sid|login|user/i.test(name)) {
    return { icon: '🔐', label: 'Auth', color: 'border-l-blue-500' };
  }
  
  // Analytics/Tracking
  if (/_ga|_gid|utm|track|analytics|stat/i.test(name)) {
    return { icon: '📊', label: 'Analytics', color: 'border-l-purple-500' };
  }
  
  // Preferences
  if (/pref|setting|config|theme|lang/i.test(name)) {
    return { icon: '⚙️', label: 'Preferences', color: 'border-l-gray-500' };
  }
  
  // Security
  if (/csrf|xss|security|nonce/i.test(name)) {
    return { icon: '🛡️', label: 'Security', color: 'border-l-green-500' };
  }
  
  // Marketing
  if (/ads|marketing|promo|campaign/i.test(name)) {
    return { icon: '📢', label: 'Marketing', color: 'border-l-orange-500' };
  }
  
  return { icon: '🍪', label: 'Other', color: 'border-l-gray-300' };
};

/**
 * Check if cookie is third-party (different domain)
 */
const isThirdParty = (domain?: string): boolean => {
  if (!domain) return false;
  const currentDomain = window.location.hostname;
  const cookieDomain = domain.replace(/^\./, '');
  
  // Check if it's a subdomain match
  if (currentDomain.endsWith(cookieDomain) || cookieDomain.endsWith(currentDomain)) {
    return false;
  }
  
  return true;
};

/**
 * CookieCard Component
 * Mobile-optimized card view for individual cookies
 */
export const CookieCard: React.FC<CookieCardProps> = ({
  cookie,
  onCopy,
  onToggleExpand,
  isExpanded,
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const category = useMemo(() => getCookieCategory(cookie.name), [cookie.name]);
  const timeRemaining = useMemo(() => getTimeRemaining(cookie.expires), [cookie.expires]);
  const expiringSoon = useMemo(() => isExpiringSoon(cookie.expires), [cookie.expires]);
  const thirdParty = useMemo(() => isThirdParty(cookie.domain), [cookie.domain]);
  
  const truncatedValue = cookie.value.length > 50 
    ? `${cookie.value.slice(0, 50)}…` 
    : cookie.value;
  
  const displayValue = isExpanded ? cookie.value : truncatedValue;
  const valueSize = (cookie.value.length / 1024).toFixed(1);

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-md mb-3
        border-l-4 ${category.color}
        transition-all duration-200
        ${showActions ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      {/* Header - Cookie Name & Category */}
      <button
        type="button"
        className="flex items-center justify-between p-3 cursor-pointer w-full text-left bg-transparent border-none"
        onClick={() => setShowActions(!showActions)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowActions(!showActions);
          }
        }}
        aria-expanded={showActions}
        aria-controls={`cookie-details-${cookie.name}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg flex-shrink-0" role="img" aria-label={category.label}>
            {category.icon}
          </span>
          <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
            {cookie.name}
          </h3>
          {thirdParty && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded flex-shrink-0">
              3rd party
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {expiringSoon && (
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded animate-pulse">
              ⚠️ Expiring
            </span>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${showActions ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      <div
        id={`cookie-details-${cookie.name}`}
        className={`
        overflow-hidden transition-all duration-300
        ${showActions ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-3 pb-3 space-y-2">
          {/* Security Badges Row */}
          <div className="flex flex-wrap gap-1.5">
            {cookie.secure ? (
              <span className="inline-flex items-center text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                🔒 Secure
              </span>
            ) : (
              <span className="inline-flex items-center text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                🔓 Insecure
              </span>
            )}
            
            {cookie.httpOnly ? (
              <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                👁️ HttpOnly
              </span>
            ) : (
              <span className="inline-flex items-center text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                ⚠️ JS Accessible
              </span>
            )}
            
            {cookie.sameSite && (
              <span className="inline-flex items-center text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                🛡️ {cookie.sameSite}
              </span>
            )}
            
            {!cookie.accessible && (
              <span className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                🚫 Inaccessible
              </span>
            )}
          </div>

          {/* Cookie Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <span className="text-gray-500 dark:text-gray-400 block">Domain</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 break-all">
                {cookie.domain || '-'}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <span className="text-gray-500 dark:text-gray-400 block">Path</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {cookie.path || '/'}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <span className="text-gray-500 dark:text-gray-400 block">Expires</span>
              <span className={`font-medium ${expiringSoon ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {timeRemaining}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <span className="text-gray-500 dark:text-gray-400 block">Size</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {cookie.size} bytes ({valueSize} KB)
              </span>
            </div>
          </div>

          {/* Value Section */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 dark:text-gray-400 text-xs">Value</span>
              <div className="flex gap-1">
                {cookie.value.length > 50 && (
                  <button
                    type="button"
                    onClick={() => onToggleExpand(cookie.name)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-0.5"
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onCopy(cookie.value, 'Cookie value')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-0.5"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="font-mono text-xs break-all text-gray-900 dark:text-gray-100 max-h-24 overflow-y-auto">
              {cookie.accessible ? displayValue : <span className="text-gray-400">•••••••• (Inaccessible)</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onCopy(cookie.name, 'Cookie name')}
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Copy Name
            </button>
            <button
              type="button"
              onClick={() => onCopy(
                JSON.stringify(cookie, null, 2), 
                'Cookie JSON'
              )}
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Copy JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieCard;

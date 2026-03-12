/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * CookieInspectorPanel - Mobile-first responsive cookie inspector UI
 * Features: Card-based layout, filter chips, sticky action bar
 */
import React, { useState, useMemo, useCallback } from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { CookieInfo } from '../lib/cookies';
import { CookieCard } from './CookieCard';

type FilterType = 'all' | 'secure' | 'httpOnly' | 'thirdParty' | 'expiring' | 'insecure';

interface Props {
  cookies: CookieInfo[];
  filter: string;
  setFilter: (v: string) => void;
  exportJson: () => void;
  expanded: Record<string, boolean>;
  toggleExpand: (name: string) => void;
  copy: (text: string, label: string) => void;
  toastMessage: string;
}

/**
 * Check if cookie is third-party (different domain)
 */
const isThirdParty = (domain?: string): boolean => {
  if (!domain) return false;
  const currentDomain = window.location.hostname;
  const cookieDomain = domain.replace(/^\./, '');
  
  if (currentDomain.endsWith(cookieDomain) || cookieDomain.endsWith(currentDomain)) {
    return false;
  }
  return true;
};

/**
 * Check if cookie is expiring soon (within 1 hour)
 */
const isExpiringSoon = (expires?: number): boolean => {
  if (!expires) return false;
  const diff = expires * 1000 - Date.now();
  return diff > 0 && diff < 3600000;
};

/**
 * Filter chip component
 */
interface FilterChipProps {
  label: string;
  icon: string;
  active: boolean;
  count: number;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, icon, active, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
      transition-all duration-200 whitespace-nowrap
      ${active 
        ? 'bg-primary-500 text-white shadow-md' 
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }
    `}
  >
    <span>{icon}</span>
    <span>{label}</span>
    <span className={`
      ml-0.5 px-1.5 py-0.5 rounded-full text-[10px]
      ${active ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'}
    `}>
      {count}
    </span>
  </button>
);

/**
 * Action bar button component
 */
interface ActionBarButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const ActionBarButton: React.FC<ActionBarButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  variant = 'secondary' 
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
      transition-all duration-200 min-w-[80px]
      ${variant === 'primary' 
        ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md' 
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }
    `}
  >
    <span>{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

/**
 * Summary stat card component
 */
interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 flex-1 min-w-0">
    <span className={`text-lg ${color}`}>{icon}</span>
    <div className="min-w-0">
      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{label}</div>
    </div>
  </div>
);

/**
 * Main CookieInspectorView Component
 */
export function CookieInspectorView({
  cookies,
  filter,
  setFilter,
  exportJson,
  expanded,
  toggleExpand,
  copy,
  toastMessage,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Calculate cookie statistics
  const stats = useMemo(() => {
    const secure = cookies.filter(c => c.secure).length;
    const httpOnly = cookies.filter(c => c.httpOnly).length;
    const thirdParty = cookies.filter(c => isThirdParty(c.domain)).length;
    const expiring = cookies.filter(c => isExpiringSoon(c.expires)).length;
    const insecure = cookies.filter(c => !c.secure).length;
    
    return { secure, httpOnly, thirdParty, expiring, insecure, total: cookies.length };
  }, [cookies]);

  // Apply filters
  const filteredCookies = useMemo(() => {
    let result = cookies;
    
    // Apply type filter
    switch (activeFilter) {
      case 'secure':
        result = result.filter(c => c.secure);
        break;
      case 'httpOnly':
        result = result.filter(c => c.httpOnly);
        break;
      case 'thirdParty':
        result = result.filter(c => isThirdParty(c.domain));
        break;
      case 'expiring':
        result = result.filter(c => isExpiringSoon(c.expires));
        break;
      case 'insecure':
        result = result.filter(c => !c.secure);
        break;
    }
    
    // Apply text search filter
    if (filter.trim()) {
      const searchLower = filter.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.domain?.toLowerCase().includes(searchLower) ||
        c.value.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [cookies, activeFilter, filter]);

  // Copy all cookies as JSON
  const copyAllAsJson = useCallback(() => {
    const json = JSON.stringify(filteredCookies, null, 2);
    copy(json, 'All cookies JSON');
  }, [filteredCookies, copy]);

  // Copy all cookie names
  const copyAllNames = useCallback(() => {
    const names = filteredCookies.map(c => c.name).join('\n');
    copy(names, 'Cookie names');
  }, [filteredCookies, copy]);

  // Handle filter chip click
  const handleFilterClick = useCallback((filterType: FilterType) => {
    setActiveFilter(prev => prev === filterType ? 'all' : filterType);
  }, []);

  return (
    <div className={`${TOOL_PANEL_CLASS} pb-20`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-2xl font-bold heading-gradient">🍪 Cookie Inspector</h2>
      </div>

      {/* Summary Stats */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
        <StatCard label="Total" value={stats.total} icon="🍪" color="" />
        <StatCard label="Secure" value={stats.secure} icon="🔒" color="text-green-500" />
        <StatCard label="HttpOnly" value={stats.httpOnly} icon="👁️" color="text-blue-500" />
        <StatCard label="3rd Party" value={stats.thirdParty} icon="🌐" color="text-orange-500" />
      </div>

      {/* Search Input */}
      <div className="mb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            className="w-full border border-gray-200 dark:border-gray-600 pl-10 pr-4 py-3 rounded-xl 
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       placeholder:text-gray-400"
            placeholder="Search cookies by name, domain, or value..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <FilterChip
          label="All"
          icon="🍪"
          active={activeFilter === 'all'}
          count={stats.total}
          onClick={() => setActiveFilter('all')}
        />
        <FilterChip
          label="Secure"
          icon="🔒"
          active={activeFilter === 'secure'}
          count={stats.secure}
          onClick={() => handleFilterClick('secure')}
        />
        <FilterChip
          label="HttpOnly"
          icon="👁️"
          active={activeFilter === 'httpOnly'}
          count={stats.httpOnly}
          onClick={() => handleFilterClick('httpOnly')}
        />
        <FilterChip
          label="3rd Party"
          icon="🌐"
          active={activeFilter === 'thirdParty'}
          count={stats.thirdParty}
          onClick={() => handleFilterClick('thirdParty')}
        />
        <FilterChip
          label="Expiring"
          icon="⚠️"
          active={activeFilter === 'expiring'}
          count={stats.expiring}
          onClick={() => handleFilterClick('expiring')}
        />
        <FilterChip
          label="Insecure"
          icon="🔓"
          active={activeFilter === 'insecure'}
          count={stats.insecure}
          onClick={() => handleFilterClick('insecure')}
        />
      </div>

      {/* Results Count */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Showing {filteredCookies.length} of {cookies.length} cookies
      </div>

      {/* Cookie Cards List */}
      <div className="space-y-0">
        {filteredCookies.map((cookie) => (
          <CookieCard
            key={cookie.name}
            cookie={cookie}
            onCopy={copy}
            onToggleExpand={toggleExpand}
            isExpanded={!!expanded[cookie.name]}
          />
        ))}
        
        {filteredCookies.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🍪</div>
            <p className="text-sm">No cookies found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 
                      backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 
                      p-3 flex justify-center gap-2 z-40 shadow-lg">
        <ActionBarButton
          icon="📋"
          label="Copy All"
          onClick={copyAllAsJson}
        />
        <ActionBarButton
          icon="📄"
          label="Copy Names"
          onClick={copyAllNames}
        />
        <ActionBarButton
          icon="📤"
          label="Export"
          onClick={exportJson}
          variant="primary"
        />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CookieInspectorView;

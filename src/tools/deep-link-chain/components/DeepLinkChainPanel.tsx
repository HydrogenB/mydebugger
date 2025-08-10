/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Enhanced Deep Link Chain View with Image Export and Full Text Display
 */
import React, { useState } from 'react';

import { RedirectHop, OpenGraphPreview } from '../lib/deepLinkChain';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { StageWrapper, StageIndicator } from '../../../shared/components/StageWrapper';

interface Props {
  url: string;
  setUrl: (v: string) => void;
  chain: RedirectHop[];
  loading: boolean;
  error: string;
  run: () => void;
  exportJson: () => void;
  exportMarkdown: () => void;
  copyMarkdown: () => void;
  utmParams: Record<string, string>;
  openGraph: OpenGraphPreview | null;
  // Enhanced features
  showFullText: boolean;
  setShowFullText: (show: boolean) => void;
  selectedImageSize: 'small' | 'medium' | 'large';
  setSelectedImageSize: (size: 'small' | 'medium' | 'large') => void;
  generateSummaryImage: () => Promise<void>;
  generateImageLoading: boolean;
  copyFullChainText: () => Promise<void>;
}

export function DeepLinkChainView({
  url,
  setUrl,
  chain,
  loading,
  error,
  run,
  exportJson,
  exportMarkdown,
  copyMarkdown,
  utmParams,
  openGraph,
  showFullText,
  setShowFullText,
  selectedImageSize,
  setSelectedImageSize,
  generateSummaryImage,
  generateImageLoading,
  copyFullChainText,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const visibleChain =
    !expanded && chain.length > 6
      ? [...chain.slice(0, 2), ...chain.slice(-2)]
      : chain;

  const statusClass = (status?: number) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400) return 'text-red-600';
    return '';
  };

  const truncateUrl = (urlStr: string, maxLength = 80) => {
    if (showFullText || urlStr.length <= maxLength) return urlStr;
    return `${urlStr.substring(0, maxLength - 3)}...`;
  };

  return (
    <div className={`${TOOL_PANEL_CLASS.replace('p-6', 'p-4')} max-w-6xl mx-auto space-y-4`}>
      {/* Stage Management */}
      <StageWrapper requiredFeature="enhanced-ui">
        <StageIndicator showProgress className="mb-4" />
      </StageWrapper>

      {/* Enhanced Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Deep Link Chain Analyzer
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Trace redirect chains, analyze UTM parameters, and export comprehensive chain data with full text display and customizable image exports.
          </p>
        </div>
        
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            {loading ? 'Analyzing...' : '🔍 Trace Chain'}
          </button>
        </div>
      </div>
      
      {error ? (
        <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      ) : null}
      
      {chain.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Redirect Trace Results</h3>
            <div className="flex gap-2 items-center">
              <div className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  id="show-full-urls"
                  checked={showFullText}
                  onChange={(e) => setShowFullText(e.target.checked)}
                />
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="show-full-urls">Show full URLs</label>
              </div>
              <button
                type="button"
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="text-blue-600 underline text-sm"
              >
                Export Options
              </button>
            </div>
          </div>

          {/* Export Options Panel */}
          {showExportOptions && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-3">Export Options</h4>
              
              {/* Traditional Exports */}
              <div className="mb-4">
                <h5 className="text-sm font-medium mb-2">Traditional Formats</h5>
                <div className="flex gap-2 text-sm">
                  <button 
                    type="button" 
                    onClick={exportJson} 
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    📄 Export JSON
                  </button>
                  <button 
                    type="button" 
                    onClick={exportMarkdown} 
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    📝 Export Markdown
                  </button>
                  <button 
                    type="button" 
                    onClick={copyMarkdown} 
                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    📋 Copy Markdown Table
                  </button>
                  <button 
                    type="button" 
                    onClick={copyFullChainText} 
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    📝 Copy Full Text
                  </button>
                </div>
              </div>

              {/* Image Export */}
              <div>
                <h5 className="text-sm font-medium mb-2">Image Export</h5>
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-sm">Size:</div>
                  <select
                    value={selectedImageSize}
                    onChange={(e) => setSelectedImageSize(e.target.value as 'small' | 'medium' | 'large')}
                    className="text-sm px-2 py-1 border rounded"
                    aria-label="Image size selection"
                  >
                    <option value="small">Small (800x600)</option>
                    <option value="medium">Medium (1200x800)</option>
                    <option value="large">Large (1600x1200)</option>
                  </select>
                  <button
                    type="button"
                    onClick={generateSummaryImage}
                    disabled={generateImageLoading}
                    className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                  >
                    {generateImageLoading ? '🔄 Generating...' : '🖼️ Download as Image'}
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Generate a summary image with the redirect chain. Use &ldquo;Show full URLs&rdquo; to include complete URLs in the image.
                </p>
              </div>
            </div>
          )}

           <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-900">
                <th className="px-2 py-1 text-left">Hop</th>
                <th className="px-2 py-1 text-left">URL</th>
                <th className="px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleChain.map((h) => {
                const realIndex = chain.indexOf(h);
                return (
                  <tr
                    key={`${h.url}-${realIndex}`}
                    className={`border-b odd:bg-gray-50 dark:odd:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 ${realIndex === chain.length - 1 ? 'bg-green-50 dark:bg-green-900' : ''}`}
                  >
                    <td className="px-2 py-1">{realIndex + 1}</td>
                    <td className="px-2 py-1 break-all font-mono text-[10px] sm:text-xs max-w-[18rem] sm:max-w-none">
                      <span title={h.url}>{truncateUrl(h.url)}</span>
                    </td>
                    <td className={`px-2 py-1 ${statusClass(h.status)}`}>{h.status ?? '—'}</td>
                  </tr>
                );
              })}
              {!expanded && chain.length > visibleChain.length && (
                <tr>
                  <td colSpan={3} className="text-center py-2">
                    <button
                      type="button"
                      className="underline text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setExpanded(true)}
                    >
                      ⬇️ Show all {chain.length} hops
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
      
      {Object.keys(utmParams).length > 0 && (
        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <h3 className="font-bold mb-2 flex items-center">
            📊 UTM Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(utmParams).map(([k, v]) => (
              <div key={k} className="flex">
                <span className="font-mono text-sm font-semibold mr-2">{k}:</span>
                <span className="text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {openGraph && (
        <div className="border rounded-lg p-4 max-w-sm bg-gray-50 dark:bg-gray-800" aria-label="Open Graph preview">
          <h3 className="font-bold mb-2">🌐 Final Destination Preview</h3>
          {openGraph.image && (
            <img 
              src={openGraph.image} 
              alt="Open Graph preview" 
              className="w-full h-auto mb-2 rounded border" 
            />
          )}
          <div className="font-semibold">{openGraph.title}</div>
          <div className="text-sm text-gray-500">{openGraph.domain}</div>
        </div>
      )}
    </div>
  );
}

export default DeepLinkChainView;


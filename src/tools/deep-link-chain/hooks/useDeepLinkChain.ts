/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState, useCallback } from 'react';
import {
  RedirectHop,
  parseUtmParams,
  fetchOpenGraph,
  OpenGraphPreview,
  followRedirectChainRemote,
} from '../lib/deepLinkChain';

export const useDeepLinkChain = (initialUrl = '') => {
  const [url, setUrl] = useState(initialUrl);
  const [chain, setChain] = useState<RedirectHop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openGraph, setOpenGraph] = useState<OpenGraphPreview | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  const [selectedImageSize, setSelectedImageSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [generateImageLoading, setGenerateImageLoading] = useState(false);

  const run = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setOpenGraph(null);
    try {
      const hops = await followRedirectChainRemote(url);
      setChain(hops);
      const last = hops[hops.length - 1];
      if (last) {
        const og = await fetchOpenGraph(last.url);
        if (og) setOpenGraph(og);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(chain, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'redirect-chain.json';
    a.click();
    URL.revokeObjectURL(href);
  };

  const exportMarkdown = () => {
    const lines = chain.map((h, i) => `- [${i === chain.length - 1 ? 'Final' : `Hop ${i + 1}`}] ${h.url}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'redirect-chain.md';
    a.click();
    URL.revokeObjectURL(href);
  };

  const copyMarkdown = async () => {
    const rows = chain.map((h, i) => `| ${i + 1} | ${h.url} | ${h.status ?? ''} |`);
    const table = ['| Hop | URL | Status |', '| --- | --- | --- |', ...rows].join('\n');
    await navigator.clipboard.writeText(table);
  };

  const generateSummaryImage = useCallback(async () => {
    if (chain.length === 0) return;
    
    setGenerateImageLoading(true);
    try {
      // Create a canvas element for generating the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Size configurations
      const sizes = {
        small: { width: 800, height: 600, fontSize: 12, lineHeight: 18 },
        medium: { width: 1200, height: 800, fontSize: 14, lineHeight: 20 },
        large: { width: 1600, height: 1200, fontSize: 16, lineHeight: 24 }
      };

      const config = sizes[selectedImageSize];
      canvas.width = config.width;
      canvas.height = config.height;

      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = '#333333';
      ctx.font = `${config.fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

      // Draw title
      ctx.font = `bold ${config.fontSize + 4}px sans-serif`;
      ctx.fillText('Deep Link Chain Analysis', 20, 40);
      ctx.font = `${config.fontSize}px sans-serif`;

      // Draw initial URL
      ctx.fillStyle = '#666666';
      ctx.fillText(`Initial URL: ${url}`, 20, 70);

      // Draw chain details
      ctx.fillStyle = '#333333';
      let y = 100;
      const maxUrlLength = Math.floor((config.width - 100) / (config.fontSize * 0.6));

      chain.forEach((hop, index) => {
        if (y > canvas.height - 50) return; // Stop if running out of space

        // Draw hop number and status
        let statusColor = '#16a34a'; // green
        if (hop.status && hop.status >= 400) {
          statusColor = '#dc2626'; // red
        } else if (hop.status && hop.status >= 300) {
          statusColor = '#2563eb'; // blue
        }
        ctx.fillStyle = statusColor;
        ctx.fillText(`${index + 1}.`, 20, y);
        ctx.fillText(`[${hop.status ?? '—'}]`, 50, y);

        // Draw URL (truncated if too long)
        ctx.fillStyle = '#333333';
        let displayUrl = hop.url;
        if (!showFullText && hop.url.length > maxUrlLength) {
          displayUrl = `${hop.url.substring(0, maxUrlLength)}...`;
        }
        ctx.fillText(displayUrl, 120, y);

        y += config.lineHeight;
      });

      // Add UTM parameters if any
      const utmParams = parseUtmParams(chain[chain.length - 1]?.url || '');
      if (Object.keys(utmParams).length > 0) {
        y += 20;
        ctx.fillStyle = '#666666';
        ctx.font = `bold ${config.fontSize}px sans-serif`;
        ctx.fillText('UTM Parameters:', 20, y);
        y += config.lineHeight;

        ctx.font = `${config.fontSize}px monospace`;
        Object.entries(utmParams).forEach(([key, value]) => {
          if (y > canvas.height - 30) return;
          ctx.fillText(`${key}: ${value}`, 40, y);
          y += config.lineHeight;
        });
      }

      // Add footer
      ctx.fillStyle = '#999999';
      ctx.font = `${config.fontSize - 2}px sans-serif`;
      ctx.fillText('Generated by MyDebugger Deep Link Chain Tool', 20, canvas.height - 20);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = imageUrl;
          a.download = `deeplink-chain-${selectedImageSize}.png`;
          a.click();
          URL.revokeObjectURL(imageUrl);
        }
      }, 'image/png');

    } catch (err) {
      setError(`Failed to generate image: ${(err as Error).message}`);
    } finally {
      setGenerateImageLoading(false);
    }
  }, [chain, url, selectedImageSize, showFullText]);

  const copyFullChainText = useCallback(async () => {
    if (chain.length === 0) return;
    
    const lines = [
      'Deep Link Chain Analysis',
      '=' .repeat(25),
      '',
      `Initial URL: ${url}`,
      '',
      'Redirect Chain:',
      ...chain.map((hop, index) => 
        `${index + 1}. [${hop.status ?? '—'}] ${hop.url}`
      )
    ];

    const utmParams = parseUtmParams(chain[chain.length - 1]?.url || '');
    if (Object.keys(utmParams).length > 0) {
      lines.push('', 'UTM Parameters:');
      Object.entries(utmParams).forEach(([key, value]) => {
        lines.push(`  ${key}: ${value}`);
      });
    }

    lines.push('', `Generated by MyDebugger at ${new Date().toLocaleString()}`);
    
    await navigator.clipboard.writeText(lines.join('\n'));
  }, [chain, url]);

  const utmParams = chain.length ? parseUtmParams(chain[chain.length - 1].url) : {};

  return {
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
    // Enhanced features
    showFullText,
    setShowFullText,
    selectedImageSize,
    setSelectedImageSize,
    generateSummaryImage,
    generateImageLoading,
    copyFullChainText,
  };
};

export default useDeepLinkChain;


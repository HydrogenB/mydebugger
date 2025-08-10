/**
 * © 2025 MyDebugger Contributors – MIT License
 * Comprehensive ViewModel Tests - Corrected Interfaces
 */

import { renderHook, act } from '@testing-library/react';
import useMetadataEcho from '../src/tools/metadata-echo/hooks/useMetadataEcho.ts';
import { useHeaderScanner } from '../src/tools/header-scanner/hooks/useHeaderScanner.ts';
import { useGenerateLargeImage } from '../src/tools/generate-large-image/hooks/useGenerateLargeImage.ts';
import useFetchRender from '../src/tools/fetch-render/hooks/useFetchRender.ts';
import useDynamicLinkProbe from '../viewmodel/useDynamicLinkProbe';
import useDeviceTrace from '../src/tools/linktracer/hooks/useDeviceTrace.ts';
import useDeepLinkChain from '../src/tools/deep-link-chain/hooks/useDeepLinkChain.ts';

// Mock implementations
jest.mock('../src/tools/metadata-echo/lib/metadata', () => ({
  getBasicMetadata: jest.fn(() => ({
    url: 'http://localhost',
    userAgent: 'Test Agent',
    timestamp: new Date().toISOString()
  })),
  getAdvancedMetadata: jest.fn(() => Promise.resolve({
    networkInfo: { effectiveType: '4g' },
    deviceInfo: { platform: 'Web' },
    permissions: {}
  }))
}));

describe('useMetadataEcho ViewModel', () => {
  it('should initialize with basic metadata', () => {
    const { result } = renderHook(() => useMetadataEcho());
    
    expect(result.current.basic).toBeDefined();
    expect(result.current.advanced).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should load advanced metadata', async () => {
    const { result } = renderHook(() => useMetadataEcho());
    
    await act(async () => {
      await result.current.loadAdvanced();
    });
    
    expect(result.current.advanced).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});

describe('useHeaderScanner ViewModel', () => {
  // Mock fetch for header scanner
  global.fetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useHeaderScanner());
    
    expect(result.current.url).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('should handle URL changes', () => {
    const { result } = renderHook(() => useHeaderScanner());
    
    act(() => {
      result.current.setUrl('https://example.com');
    });
    
    expect(result.current.url).toBe('https://example.com');
  });

  it('should scan headers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'text/html',
        'x-frame-options': 'SAMEORIGIN'
      })
    });

    const { result } = renderHook(() => useHeaderScanner());
    
    act(() => {
      result.current.setUrl('https://example.com');
    });

    await act(async () => {
      await result.current.scan();
    });
    
    expect(result.current.results).toBeDefined();
    expect(result.current.loading).toBe(false);
  });

  it('should handle scan errors', async () => {
    const { result } = renderHook(() => useHeaderScanner());
    
    await act(async () => {
      await result.current.scan(); // Empty URL should trigger error
    });
    
    expect(result.current.error).toBe('URL required');
  });

  it('should copy headers to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve())
      }
    });

    const { result } = renderHook(() => useHeaderScanner());
    
    await act(async () => {
      await result.current.copyHeaders();
    });
    
    expect(result.current.copied).toBe(true);
  });
});

describe('useGenerateLargeImage ViewModel', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGenerateLargeImage());
    
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(1024);
    expect(result.current.format).toBe('png');
    expect(result.current.isGenerating).toBe(false);
  });

  it('should update dimensions', () => {
    const { result } = renderHook(() => useGenerateLargeImage());
    
    act(() => {
      result.current.setWidth(2048);
      result.current.setHeight(1536);
      result.current.setFormat('jpeg');
    });
    
    expect(result.current.width).toBe(2048);
    expect(result.current.height).toBe(1536);
    expect(result.current.format).toBe('jpeg');
  });

  it('should generate image', async () => {
    const { result } = renderHook(() => useGenerateLargeImage());
    
    await act(async () => {
      await result.current.generateImage();
    });
    
    expect(result.current.generatedImage).toBeDefined();
    expect(result.current.isGenerating).toBe(false);
  });

  it('should calculate file size', () => {
    const { result } = renderHook(() => useGenerateLargeImage());
    
    act(() => {
      result.current.setWidth(100);
      result.current.setHeight(100);
    });
    
    expect(result.current.estimatedSize).toBeGreaterThan(0);
  });
});

describe('useFetchRender ViewModel', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFetchRender());
    
    expect(result.current.url).toBe('');
    expect(result.current.userAgent).toBeDefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.snapshots).toEqual([]);
  });

  it('should update URL and user agent', () => {
    const { result } = renderHook(() => useFetchRender());
    
    act(() => {
      result.current.setUrl('https://example.com');
      result.current.setUserAgent('Custom User Agent');
    });
    
    expect(result.current.url).toBe('https://example.com');
    expect(result.current.userAgent).toBe('Custom User Agent');
  });

  it('should fetch and render page', async () => {
    const mockSnapshot = {
      url: 'https://example.com',
      title: 'Test Page',
      html: '<html><body>Test</body></html>',
      screenshot: 'data:image/png;base64,test'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSnapshot)
    });

    const { result } = renderHook(() => useFetchRender());
    
    act(() => {
      result.current.setUrl('https://example.com');
    });

    await act(async () => {
      await result.current.fetchAndRender();
    });
    
    expect(result.current.snapshots).toHaveLength(1);
    expect(result.current.snapshots[0]).toEqual(mockSnapshot);
  });
});

describe('useDynamicLinkProbe ViewModel', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDynamicLinkProbe());
    
    expect(result.current.url).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it('should probe dynamic link', async () => {
    const mockResults = [
      { platform: 'android', resolved: 'https://play.google.com/store', status: 'success' },
      { platform: 'ios', resolved: 'https://apps.apple.com/app', status: 'success' }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    const { result } = renderHook(() => useDynamicLinkProbe());
    
    act(() => {
      result.current.setUrl('https://example.page.link/test');
    });

    await act(async () => {
      await result.current.probe();
    });
    
    expect(result.current.results).toEqual(mockResults);
  });
});

describe('useDeviceTrace ViewModel', () => {
  it('should initialize with device info', () => {
    const { result } = renderHook(() => useDeviceTrace());
    
    expect(result.current.deviceInfo).toBeDefined();
    expect(result.current.isActive).toBe(false);
    expect(result.current.traces).toEqual([]);
  });

  it('should start and stop tracing', () => {
    const { result } = renderHook(() => useDeviceTrace());
    
    act(() => {
      result.current.startTrace();
    });
    
    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.stopTrace();
    });
    
    expect(result.current.isActive).toBe(false);
  });

  it('should save trace snapshot', () => {
    const { result } = renderHook(() => useDeviceTrace());
    
    act(() => {
      result.current.saveSnapshot();
    });
    
    expect(result.current.traces).toHaveLength(1);
  });
});

describe('useDeepLinkChain ViewModel', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDeepLinkChain());
    
    expect(result.current.url).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.chain).toEqual([]);
  });

  it('should trace deep link chain', async () => {
    const mockChain = [
      { url: 'https://short.link/abc', redirectTo: 'https://example.com/redirect', status: 302 },
      { url: 'https://example.com/redirect', redirectTo: 'app://deeplink', status: 200 }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockChain)
    });

    const { result } = renderHook(() => useDeepLinkChain());
    
    act(() => {
      result.current.setUrl('https://short.link/abc');
    });

    await act(async () => {
      await result.current.trace();
    });
    
    expect(result.current.chain).toEqual(mockChain);
  });

  it('should clear chain', () => {
    const { result } = renderHook(() => useDeepLinkChain());
    
    // Add some data first
    act(() => {
      result.current.setUrl('https://example.com');
    });

    act(() => {
      result.current.clear();
    });
    
    expect(result.current.url).toBe('');
    expect(result.current.chain).toEqual([]);
  });
});

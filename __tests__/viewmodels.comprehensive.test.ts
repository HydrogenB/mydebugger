/**
 * © 2025 MyDebugger Contributors – MIT License
 * Comprehensive ViewModel Tests
 */

import { renderHook, act } from '@testing-library/react';
import useMetadataEcho from '../src/tools/metadata-echo/hooks/useMetadataEcho.ts';
import useHeaderScanner from '../src/tools/header-scanner/hooks/useHeaderScanner.ts';
import useGenerateLargeImage from '../src/tools/generate-large-image/hooks/useGenerateLargeImage.ts';
import useFetchRender from '../src/tools/fetch-render/hooks/useFetchRender.ts';
import useDynamicLinkProbe from '../src/tools/dynamic-link-probe/hooks/useDynamicLinkProbe.ts';
import useDeviceTrace from '../src/tools/linktracer/hooks/useDeviceTrace.ts';
import useDeepLinkChain from '../src/tools/deep-link-chain/hooks/useDeepLinkChain.ts';

// Mock fetch globally
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useMetadataEcho ViewModel', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMetadataEcho());
    
    expect(result.current.url).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.metadata).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should update URL state', () => {
    const { result } = renderHook(() => useMetadataEcho());
    
    act(() => {
      result.current.setUrl('https://example.com');
    });
    
    expect(result.current.url).toBe('https://example.com');
  });

  it('should handle fetch metadata', async () => {
    const mockMetadata = {
      title: 'Test Title',
      description: 'Test Description',
      image: 'https://example.com/image.jpg'
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMetadata)
    });

    const { result } = renderHook(() => useMetadataEcho());
    
    await act(async () => {
      result.current.setUrl('https://example.com');
      await result.current.fetchMetadata();
    });
    
    expect(result.current.metadata).toEqual(mockMetadata);
    expect(result.current.error).toBe('');
  });
});

describe('useHeaderScanner ViewModel', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useHeaderScanner());
    
    expect(result.current.url).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should handle header scanning', async () => {
    const mockHeaders = {
      'content-type': 'text/html',
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff'
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Map(Object.entries(mockHeaders))
    });

    const { result } = renderHook(() => useHeaderScanner());
    
    await act(async () => {
      result.current.setUrl('https://example.com');
      await result.current.scanHeaders();
    });
    
    expect(result.current.results).toBeDefined();
    expect(result.current.error).toBe('');
  });
});

describe('useGenerateLargeImage ViewModel', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGenerateLargeImage());
    
    expect(result.current.size).toBe(1024);
    expect(result.current.format).toBe('png');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generatedImage).toBeNull();
  });

  it('should update size and format', () => {
    const { result } = renderHook(() => useGenerateLargeImage());
    
    act(() => {
      result.current.setSize(2048);
      result.current.setFormat('jpg');
    });
    
    expect(result.current.size).toBe(2048);
    expect(result.current.format).toBe('jpg');
  });

  it('should generate image blob', async () => {
    const { result } = renderHook(() => useGenerateLargeImage());
    
    await act(async () => {
      await result.current.generateImage();
    });
    
    expect(result.current.generatedImage).toBeDefined();
    expect(result.current.isGenerating).toBe(false);
  });
});

describe('useFetchRender ViewModel', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFetchRender());
    
    expect(result.current.url).toBe('');
    expect(result.current.userAgent).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.result).toBeNull();
  });

  it('should handle URL rendering', async () => {
    const mockResult = {
      html: '<html><head><title>Test</title></head><body>Content</body></html>',
      title: 'Test',
      description: 'Test page',
      screenshot: 'data:image/png;base64,test'
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult)
    });

    const { result } = renderHook(() => useFetchRender());
    
    await act(async () => {
      result.current.setUrl('https://example.com');
      await result.current.fetchAndRender();
    });
    
    expect(result.current.result).toEqual(mockResult);
  });
});

describe('useDynamicLinkProbe ViewModel', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDynamicLinkProbe());
    
    expect(result.current.dynamicLink).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.probeResults).toEqual([]);
  });

  it('should probe dynamic link', async () => {
    const mockProbeResults = [
      { platform: 'android', fallback: 'https://play.google.com/store', status: 'success' },
      { platform: 'ios', fallback: 'https://apps.apple.com/app', status: 'success' }
    ];
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProbeResults)
    });

    const { result } = renderHook(() => useDynamicLinkProbe());
    
    await act(async () => {
      result.current.setDynamicLink('https://example.page.link/test');
      await result.current.probeDynamicLink();
    });
    
    expect(result.current.probeResults).toEqual(mockProbeResults);
  });
});

describe('useDeviceTrace ViewModel', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDeviceTrace());
    
    expect(result.current.isTracing).toBe(false);
    expect(result.current.traceData).toEqual([]);
    expect(result.current.deviceInfo).toBeDefined();
  });

  it('should start device tracing', async () => {
    const { result } = renderHook(() => useDeviceTrace());
    
    await act(async () => {
      await result.current.startTracing();
    });
    
    expect(result.current.isTracing).toBe(true);
    expect(result.current.traceData.length).toBeGreaterThan(0);
  });

  it('should stop device tracing', () => {
    const { result } = renderHook(() => useDeviceTrace());
    
    act(() => {
      result.current.stopTracing();
    });
    
    expect(result.current.isTracing).toBe(false);
  });
});

describe('useDeepLinkChain ViewModel', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDeepLinkChain());
    
    expect(result.current.deepLink).toBe('');
    expect(result.current.chainResults).toEqual([]);
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('should analyze deep link chain', async () => {
    const mockChainResults = [
      { url: 'https://example.com/link1', redirectTo: 'https://example.com/link2', status: 302 },
      { url: 'https://example.com/link2', redirectTo: 'app://open', status: 302 }
    ];
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockChainResults)
    });

    const { result } = renderHook(() => useDeepLinkChain());
    
    await act(async () => {
      result.current.setDeepLink('https://example.com/link1');
      await result.current.analyzeChain();
    });
    
    expect(result.current.chainResults).toEqual(mockChainResults);
  });

  it('should handle chain analysis error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDeepLinkChain());
    
    await act(async () => {
      result.current.setDeepLink('https://invalid-url');
      await result.current.analyzeChain();
    });
    
    expect(result.current.error).toBe('Network error');
    expect(result.current.isAnalyzing).toBe(false);
  });
});

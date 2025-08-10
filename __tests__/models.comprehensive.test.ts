/**
 * © 2025 MyDebugger Contributors – MIT License
 * Comprehensive Model Tests
 */

import { normalizeUrl, validateUrl, extractDomain, sanitizeInput } from '../src/tools/url/lib/url';
import { analyzeHeaders, HeaderAuditResult, getSecurityScore } from '../src/tools/header-scanner/lib/headerScanner';
import { getBasicMetadata, getAdvancedMetadata } from '../src/tools/metadata-echo/lib/metadata';
import { generateLargeImage, calculateImageSize } from '../src/tools/generate-large-image/lib/generateLargeImage';
import { compressImage, resizeImage } from '../src/tools/image-compressor/lib/imageCompressor';
import { parseVCardString, generateVCard, formatContact } from '../src/tools/virtual-card/lib/virtualCard';
import { detectBrowser, getDeviceInfo, getNetworkInfo } from '../src/tools/device-trace/lib/deviceTrace';
import { validateChain, resolveRedirects, analyzeDeepLink } from '../src/tools/deep-link-chain/lib/deepLinkChain';

describe('URL Model Functions', () => {
  describe('normalizeUrl', () => {
    it('should add https protocol if missing', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
    });

    it('should preserve existing protocol', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should trim whitespace', () => {
      expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com');
    });

    it('should handle empty strings', () => {
      expect(normalizeUrl('')).toBe('');
      expect(normalizeUrl('   ')).toBe('');
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('https://subdomain.example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false);
      expect(validateUrl('javascript:alert(1)')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateUrl('')).toBe(false);
      expect(validateUrl('//example.com')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('should extract domain from URLs', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com');
      expect(extractDomain('http://subdomain.example.com')).toBe('subdomain.example.com');
    });

    it('should handle localhost', () => {
      expect(extractDomain('http://localhost:3000')).toBe('localhost');
    });

    it('should return empty for invalid URLs', () => {
      expect(extractDomain('invalid-url')).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).not.toContain('<script>');
      expect(sanitizeInput('test&lt;script&gt;')).toContain('script');
    });

    it('should preserve safe characters', () => {
      expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
      expect(sanitizeInput('user@example.com')).toBe('user@example.com');
    });
  });
});

describe('Header Scanner Model', () => {
  describe('analyzeHeaders', () => {
    it('should analyze security headers', () => {
      const headers = new Headers({
        'x-frame-options': 'SAMEORIGIN',
        'x-content-type-options': 'nosniff',
        'strict-transport-security': 'max-age=31536000',
        'content-security-policy': "default-src 'self'"
      });

      const results = analyzeHeaders(headers);
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      const frameOptions = results.find(r => r.header === 'X-Frame-Options');
      expect(frameOptions?.status).toBe('good');
    });

    it('should detect missing headers', () => {
      const headers = new Headers({
        'content-type': 'text/html'
      });

      const results = analyzeHeaders(headers);
      const missingHeaders = results.filter(r => r.status === 'missing');
      expect(missingHeaders.length).toBeGreaterThan(0);
    });

    it('should validate CSP policies', () => {
      const headers = new Headers({
        'content-security-policy': "default-src 'unsafe-inline'"
      });

      const results = analyzeHeaders(headers);
      const cspResult = results.find(r => r.header === 'Content-Security-Policy');
      expect(cspResult?.status).toBe('warning');
    });
  });

  describe('getSecurityScore', () => {
    it('should calculate security score', () => {
      const goodResults: HeaderAuditResult[] = [
        { header: 'X-Frame-Options', status: 'good', value: 'SAMEORIGIN', description: 'Good' },
        { header: 'X-Content-Type-Options', status: 'good', value: 'nosniff', description: 'Good' }
      ];

      const score = getSecurityScore(goodResults);
      expect(score).toBeGreaterThan(50);
    });

    it('should penalize missing headers', () => {
      const badResults: HeaderAuditResult[] = [
        { header: 'X-Frame-Options', status: 'missing', value: '', description: 'Missing' },
        { header: 'X-Content-Type-Options', status: 'missing', value: '', description: 'Missing' }
      ];

      const score = getSecurityScore(badResults);
      expect(score).toBeLessThan(50);
    });
  });
});

describe('Metadata Model', () => {
  describe('getBasicMetadata', () => {
    it('should return basic metadata', () => {
      const metadata = getBasicMetadata();
      
      expect(metadata).toHaveProperty('url');
      expect(metadata).toHaveProperty('userAgent');
      expect(metadata).toHaveProperty('timestamp');
      expect(metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should include current URL', () => {
      const metadata = getBasicMetadata();
      expect(typeof metadata.url).toBe('string');
    });
  });

  describe('getAdvancedMetadata', () => {
    it('should return advanced metadata', async () => {
      const metadata = await getAdvancedMetadata();
      
      expect(metadata).toHaveProperty('networkInfo');
      expect(metadata).toHaveProperty('deviceInfo');
      expect(metadata).toHaveProperty('permissions');
    });

    it('should handle permission errors gracefully', async () => {
      // Mock permission denial
      const mockQuery = jest.fn().mockRejectedValue(new Error('Permission denied'));
      Object.defineProperty(navigator, 'permissions', {
        value: { query: mockQuery },
        writable: true
      });

      const metadata = await getAdvancedMetadata();
      expect(metadata.permissions).toBeDefined();
    });
  });
});

describe('Image Generation Model', () => {
  describe('calculateImageSize', () => {
    it('should calculate image size correctly', () => {
      const size = calculateImageSize(1024, 1024, 'png');
      expect(size).toBeGreaterThan(0);
      
      const jpegSize = calculateImageSize(1024, 1024, 'jpeg');
      const pngSize = calculateImageSize(1024, 1024, 'png');
      expect(jpegSize).toBeLessThan(pngSize); // JPEG should be smaller
    });

    it('should handle different dimensions', () => {
      const smallSize = calculateImageSize(100, 100, 'png');
      const largeSize = calculateImageSize(2000, 2000, 'png');
      expect(largeSize).toBeGreaterThan(smallSize);
    });
  });

  describe('generateLargeImage', () => {
    // Mock canvas for testing
    beforeEach(() => {
      const mockCanvas = {
        getContext: jest.fn(() => ({
          fillRect: jest.fn(),
          fillStyle: '',
          font: '',
          fillText: jest.fn(),
          measureText: jest.fn(() => ({ width: 100 }))
        })),
        toBlob: jest.fn((callback) => callback(new Blob(['test'], { type: 'image/png' })))
      };
      
      global.HTMLCanvasElement = jest.fn(() => mockCanvas) as any;
      Object.setPrototypeOf(HTMLCanvasElement.prototype, mockCanvas);
    });

    it('should generate image blob', async () => {
      const blob = await generateLargeImage(1024, 1024, 'png');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should handle different formats', async () => {
      const pngBlob = await generateLargeImage(512, 512, 'png');
      const jpegBlob = await generateLargeImage(512, 512, 'jpeg');
      
      expect(pngBlob.type).toBe('image/png');
      expect(jpegBlob.type).toBe('image/jpeg');
    });
  });
});

describe('Image Compressor Model', () => {
  describe('resizeImage', () => {
    it('should resize image dimensions', async () => {
      // Mock image and canvas
      const mockImage = {
        width: 1000,
        height: 800,
        onload: null as any
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => ({
          drawImage: jest.fn()
        }))
      };

      global.Image = jest.fn(() => mockImage) as any;
      global.HTMLCanvasElement = jest.fn(() => mockCanvas) as any;

      // Simulate image load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      const result = await resizeImage(new File(['test'], 'test.jpg'), 500, 400);
      expect(mockCanvas.width).toBe(500);
      expect(mockCanvas.height).toBe(400);
    });
  });

  describe('compressImage', () => {
    it('should compress image quality', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock canvas toBlob
      const mockCanvas = {
        toBlob: jest.fn((callback) => 
          callback(new Blob(['compressed'], { type: 'image/jpeg' }))
        )
      };

      const result = await compressImage(mockFile, 0.8);
      expect(result).toBeInstanceOf(File);
    });
  });
});

describe('Virtual Card Model', () => {
  describe('generateVCard', () => {
    it('should generate valid vCard string', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        organization: 'Example Corp'
      };

      const vcard = generateVCard(contact);
      expect(vcard).toContain('BEGIN:VCARD');
      expect(vcard).toContain('END:VCARD');
      expect(vcard).toContain('FN:John Doe');
      expect(vcard).toContain('EMAIL:john@example.com');
    });

    it('should handle optional fields', () => {
      const contact = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      const vcard = generateVCard(contact);
      expect(vcard).toContain('FN:Jane Doe');
      expect(vcard).not.toContain('TEL:');
    });
  });

  describe('parseVCardString', () => {
    it('should parse vCard string', () => {
      const vcardString = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
EMAIL:john@example.com
TEL:+1234567890
END:VCARD`;

      const contact = parseVCardString(vcardString);
      expect(contact.name).toBe('John Doe');
      expect(contact.email).toBe('john@example.com');
      expect(contact.phone).toBe('+1234567890');
    });

    it('should handle malformed vCard', () => {
      const invalidVCard = 'Not a vCard';
      const contact = parseVCardString(invalidVCard);
      expect(contact.name).toBe('');
    });
  });
});

describe('Device Trace Model', () => {
  describe('detectBrowser', () => {
    it('should detect browser from user agent', () => {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const browser = detectBrowser(chromeUA);
      expect(browser.name).toBe('Chrome');
      expect(browser.version).toContain('91');
    });

    it('should handle unknown user agents', () => {
      const unknownUA = 'Unknown Browser/1.0';
      const browser = detectBrowser(unknownUA);
      expect(browser.name).toBe('Unknown');
    });
  });

  describe('getDeviceInfo', () => {
    it('should gather device information', () => {
      const deviceInfo = getDeviceInfo();
      expect(deviceInfo).toHaveProperty('platform');
      expect(deviceInfo).toHaveProperty('screenWidth');
      expect(deviceInfo).toHaveProperty('screenHeight');
      expect(deviceInfo).toHaveProperty('timezone');
    });
  });

  describe('getNetworkInfo', () => {
    it('should get network information', () => {
      // Mock navigator.connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 100
        },
        writable: true
      });

      const networkInfo = getNetworkInfo();
      expect(networkInfo.effectiveType).toBe('4g');
      expect(networkInfo.downlink).toBe(10);
    });

    it('should handle missing connection API', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        writable: true
      });

      const networkInfo = getNetworkInfo();
      expect(networkInfo.effectiveType).toBe('unknown');
    });
  });
});

describe('Deep Link Chain Model', () => {
  describe('validateChain', () => {
    it('should validate redirect chain', () => {
      const validChain = [
        { url: 'https://short.ly/abc', redirectTo: 'https://example.com', status: 302 },
        { url: 'https://example.com', redirectTo: '', status: 200 }
      ];

      const result = validateChain(validChain);
      expect(result.isValid).toBe(true);
      expect(result.totalRedirects).toBe(1);
    });

    it('should detect redirect loops', () => {
      const loopChain = [
        { url: 'https://a.com', redirectTo: 'https://b.com', status: 302 },
        { url: 'https://b.com', redirectTo: 'https://a.com', status: 302 }
      ];

      const result = validateChain(loopChain);
      expect(result.hasLoop).toBe(true);
    });

    it('should detect too many redirects', () => {
      const longChain = Array.from({ length: 15 }, (_, i) => ({
        url: `https://redirect${i}.com`,
        redirectTo: `https://redirect${i + 1}.com`,
        status: 302
      }));

      const result = validateChain(longChain);
      expect(result.tooManyRedirects).toBe(true);
    });
  });

  describe('analyzeDeepLink', () => {
    it('should analyze deep link structure', () => {
      const deepLink = 'myapp://profile/123?ref=share&campaign=summer';
      const analysis = analyzeDeepLink(deepLink);
      
      expect(analysis.scheme).toBe('myapp');
      expect(analysis.host).toBe('profile');
      expect(analysis.path).toBe('123');
      expect(analysis.parameters).toHaveProperty('ref', 'share');
      expect(analysis.parameters).toHaveProperty('campaign', 'summer');
    });

    it('should handle HTTP URLs', () => {
      const httpUrl = 'https://example.com/path?param=value';
      const analysis = analyzeDeepLink(httpUrl);
      
      expect(analysis.scheme).toBe('https');
      expect(analysis.host).toBe('example.com');
    });

    it('should handle malformed URLs', () => {
      const malformed = 'not-a-url';
      const analysis = analyzeDeepLink(malformed);
      
      expect(analysis.scheme).toBe('unknown');
      expect(analysis.isValid).toBe(false);
    });
  });
});

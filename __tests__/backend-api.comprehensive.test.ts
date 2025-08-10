/**
 * © 2025 MyDebugger Contributors – MIT License
 * Backend API Comprehensive Test Suite
 * Complete coverage for all server-side functionality and API endpoints
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';

// Import API modules
// Backend Node modules are not part of the client-only refactor; skip this suite
describe.skip('Backend API Comprehensive Test Suite (skipped in client-only repo)', () => {});

// Mock external dependencies
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

beforeAll(() => {
  // Mock console methods to avoid noise in tests
  Object.assign(console, mockConsole);
  
  // Mock process.env for environment variables
  process.env.NODE_ENV = 'test';
  process.env.API_BASE_URL = 'http://localhost:3000';
  process.env.MAX_CONCURRENT_REQUESTS = '10';
  process.env.REQUEST_TIMEOUT = '30000';
});

afterAll(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockClear();
});

describe('Audit Tools API Comprehensive Tests', () => {
  test('should analyze HTTP headers comprehensively', async () => {
    const mockHeaders = {
      'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '1; mode=block',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=(), geolocation=()',
      'server': 'nginx/1.18.0',
      'x-powered-by': 'Express'
    };

    const analysis = auditTools.analyzeHeaders(mockHeaders);

    expect(analysis).toHaveProperty('securityScore');
    expect(analysis.securityScore).toBeGreaterThan(70);
    
    expect(analysis).toHaveProperty('findings');
    expect(Array.isArray(analysis.findings)).toBe(true);
    
    // Test CSP analysis
    const cspFinding = analysis.findings.find(f => f.category === 'csp');
    expect(cspFinding).toBeDefined();
    expect(cspFinding?.severity).toBe('medium'); // unsafe-inline detected
    
    // Test HSTS analysis
    const hstsFinding = analysis.findings.find(f => f.category === 'hsts');
    expect(hstsFinding?.severity).toBe('info'); // properly configured
    
    // Test information disclosure
    const infoDisclosureFinding = analysis.findings.find(f => f.category === 'information-disclosure');
    expect(infoDisclosureFinding).toBeDefined(); // Server and X-Powered-By headers
  });

  test('should detect missing security headers', async () => {
    const minimalHeaders = {
      'content-type': 'text/html; charset=utf-8',
      'server': 'Apache/2.4.41'
    };

    const analysis = auditTools.analyzeHeaders(minimalHeaders);

    expect(analysis.securityScore).toBeLessThan(30);
    
    const findings = analysis.findings;
    
    // Should detect missing critical headers
    expect(findings.some(f => f.title.includes('Content Security Policy'))).toBe(true);
    expect(findings.some(f => f.title.includes('Strict-Transport-Security'))).toBe(true);
    expect(findings.some(f => f.title.includes('X-Frame-Options'))).toBe(true);
    expect(findings.some(f => f.title.includes('X-Content-Type-Options'))).toBe(true);
  });

  test('should perform comprehensive SSL/TLS analysis', async () => {
    const sslConfig = {
      protocol: 'TLSv1.3',
      cipher: 'TLS_AES_256_GCM_SHA384',
      keyExchange: 'X25519',
      authentication: 'RSA',
      encryption: 'AES256-GCM',
      mac: 'AEAD',
      certificateChain: [
        {
          subject: 'CN=example.com',
          issuer: 'CN=DigiCert Global Root CA',
          notBefore: '2024-01-01T00:00:00Z',
          notAfter: '2025-01-01T00:00:00Z',
          keySize: 2048,
          signatureAlgorithm: 'sha256WithRSAEncryption'
        }
      ]
    };

    const analysis = auditTools.analyzeSSL(sslConfig);

    expect(analysis).toHaveProperty('grade');
    expect(analysis.grade).toBe('A+');
    
    expect(analysis).toHaveProperty('vulnerabilities');
    expect(analysis.vulnerabilities).toHaveLength(0);
    
    expect(analysis).toHaveProperty('recommendations');
    expect(Array.isArray(analysis.recommendations)).toBe(true);
  });

  test('should detect SSL/TLS vulnerabilities', async () => {
    const vulnerableSslConfig = {
      protocol: 'TLSv1.2',
      cipher: 'TLS_RSA_WITH_AES_128_CBC_SHA',
      keyExchange: 'RSA',
      authentication: 'RSA',
      encryption: 'AES128-CBC',
      mac: 'SHA1',
      certificateChain: [
        {
          subject: 'CN=example.com',
          issuer: 'CN=Self-Signed',
          notBefore: '2020-01-01T00:00:00Z',
          notAfter: '2022-01-01T00:00:00Z', // Expired
          keySize: 1024, // Weak key
          signatureAlgorithm: 'md5WithRSAEncryption' // Weak signature
        }
      ]
    };

    const analysis = auditTools.analyzeSSL(vulnerableSslConfig);

    expect(analysis.grade).toBe('F');
    
    const vulnerabilities = analysis.vulnerabilities;
    expect(vulnerabilities.some(v => v.includes('expired certificate'))).toBe(true);
    expect(vulnerabilities.some(v => v.includes('weak key size'))).toBe(true);
    expect(vulnerabilities.some(v => v.includes('weak signature algorithm'))).toBe(true);
    expect(vulnerabilities.some(v => v.includes('CBC cipher'))).toBe(true);
  });

  test('should analyze CORS configuration', async () => {
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization, X-Requested-With',
      'access-control-allow-credentials': 'true',
      'access-control-max-age': '86400'
    };

    const analysis = auditTools.analyzeCORS(corsHeaders);

    expect(analysis).toHaveProperty('risk');
    expect(analysis.risk).toBe('high'); // Wildcard origin with credentials
    
    expect(analysis).toHaveProperty('issues');
    const issues = analysis.issues;
    expect(issues.some(i => i.includes('wildcard origin'))).toBe(true);
    expect(issues.some(i => i.includes('credentials allowed'))).toBe(true);
  });

  test('should detect clickjacking vulnerabilities', async () => {
    const headers = {
      'x-frame-options': 'ALLOWALL' // Invalid value
    };

    const analysis = auditTools.analyzeClickjacking(headers);

    expect(analysis).toHaveProperty('vulnerable');
    expect(analysis.vulnerable).toBe(true);
    
    expect(analysis).toHaveProperty('protection');
    expect(analysis.protection).toBe('invalid');
    
    expect(analysis).toHaveProperty('recommendations');
    expect(analysis.recommendations).toContain('Set X-Frame-Options to DENY or SAMEORIGIN');
  });

  test('should perform content security policy analysis', async () => {
    const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-eval' data:; object-src 'none'";
    
    const analysis = auditTools.analyzeCSP(cspHeader);

    expect(analysis).toHaveProperty('directives');
    expect(analysis.directives).toHaveProperty('default-src');
    expect(analysis.directives['default-src']).toContain("'self'");
    
    expect(analysis).toHaveProperty('warnings');
    const warnings = analysis.warnings;
    expect(warnings.some(w => w.includes('unsafe-eval'))).toBe(true);
    expect(warnings.some(w => w.includes('data: scheme'))).toBe(true);
    
    expect(analysis).toHaveProperty('score');
    expect(analysis.score).toBeLessThan(80); // Deducted for unsafe directives
  });
});

describe('Deep Link Chain API Tests', () => {
  test('should trace deep link redirections', async () => {
    const mockResponses = [
      {
        url: 'https://example.com/redirect1',
        status: 302,
        headers: { location: 'https://app.example.com/redirect2' }
      },
      {
        url: 'https://app.example.com/redirect2',
        status: 301,
        headers: { location: 'myapp://open?param=value' }
      },
      {
        url: 'myapp://open?param=value',
        status: 200,
        headers: {}
      }
    ];

    let callCount = 0;
    mockFetch.mockImplementation(() => {
      const response = mockResponses[callCount++];
      return Promise.resolve({
        ok: response.status < 400,
        status: response.status,
        headers: new Headers(response.headers),
        url: response.url
      });
    });

    const chain = await deepLinkChain.traceRedirects('https://example.com/redirect1');

    expect(chain).toHaveLength(3);
    expect(chain[0].url).toBe('https://example.com/redirect1');
    expect(chain[1].url).toBe('https://app.example.com/redirect2');
    expect(chain[2].url).toBe('myapp://open?param=value');
    
    expect(chain[0].type).toBe('http');
    expect(chain[2].type).toBe('deep-link');
  });

  test('should handle circular redirects', async () => {
    const mockResponses = [
      {
        url: 'https://example.com/a',
        status: 302,
        headers: { location: 'https://example.com/b' }
      },
      {
        url: 'https://example.com/b',
        status: 302,
        headers: { location: 'https://example.com/a' }
      }
    ];

    let callCount = 0;
    mockFetch.mockImplementation(() => {
      const response = mockResponses[callCount % 2];
      callCount++;
      return Promise.resolve({
        ok: true,
        status: response.status,
        headers: new Headers(response.headers),
        url: response.url
      });
    });

    const result = await deepLinkChain.traceRedirects('https://example.com/a', { maxRedirects: 5 });

    expect(result).toHaveProperty('error');
    expect(result.error).toContain('circular redirect');
  });

  test('should analyze deep link parameters', async () => {
    const deepLink = 'myapp://action?user_id=123&token=abc&utm_source=campaign&data=eyJ0ZXN0IjoidmFsdWUifQ==';
    
    const analysis = deepLinkChain.analyzeParameters(deepLink);

    expect(analysis).toHaveProperty('scheme');
    expect(analysis.scheme).toBe('myapp');
    
    expect(analysis).toHaveProperty('action');
    expect(analysis.action).toBe('action');
    
    expect(analysis).toHaveProperty('parameters');
    expect(analysis.parameters).toHaveProperty('user_id');
    expect(analysis.parameters.user_id).toBe('123');
    
    expect(analysis).toHaveProperty('tracking');
    expect(analysis.tracking).toContain('utm_source');
    
    expect(analysis).toHaveProperty('encoded');
    expect(analysis.encoded).toHaveLength(1); // base64 encoded data
  });

  test('should validate Universal Links configuration', async () => {
    const appleAppSiteAssociation = {
      applinks: {
        apps: [],
        details: [
          {
            appID: 'TEAM123.com.example.app',
            paths: ['/app/*', '/share/*']
          }
        ]
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(appleAppSiteAssociation),
      headers: new Headers({
        'content-type': 'application/json'
      })
    });

    const validation = await deepLinkChain.validateUniversalLinks('https://example.com');

    expect(validation).toHaveProperty('valid');
    expect(validation.valid).toBe(true);
    
    expect(validation).toHaveProperty('appIds');
    expect(validation.appIds).toContain('TEAM123.com.example.app');
    
    expect(validation).toHaveProperty('paths');
    expect(validation.paths).toContain('/app/*');
  });

  test('should validate Android App Links', async () => {
    const digitalAssetLinks = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.example.app',
          sha256_cert_fingerprints: ['AB:CD:EF:12:34:56:78:90']
        }
      }
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(digitalAssetLinks),
      headers: new Headers({
        'content-type': 'application/json'
      })
    });

    const validation = await deepLinkChain.validateAppLinks('https://example.com');

    expect(validation).toHaveProperty('valid');
    expect(validation.valid).toBe(true);
    
    expect(validation).toHaveProperty('packages');
    expect(validation.packages).toContain('com.example.app');
    
    expect(validation).toHaveProperty('fingerprints');
    expect(validation.fingerprints).toContain('AB:CD:EF:12:34:56:78:90');
  });
});

describe('Headless Runner API Tests', () => {
  test('should execute JavaScript in isolated context', async () => {
    const script = `
      const result = {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        calculation: 2 + 2
      };
      return result;
    `;

    const execution = await headlessRunner.executeScript(script);

    expect(execution).toHaveProperty('success');
    expect(execution.success).toBe(true);
    
    expect(execution).toHaveProperty('result');
    expect(execution.result.calculation).toBe(4);
    expect(execution.result.userAgent).toContain('Node.js');
    expect(typeof execution.result.timestamp).toBe('number');
  });

  test('should handle script errors safely', async () => {
    const maliciousScript = `
      // Attempt to access file system
      const fs = require('fs');
      fs.readFileSync('/etc/passwd');
    `;

    const execution = await headlessRunner.executeScript(maliciousScript);

    expect(execution).toHaveProperty('success');
    expect(execution.success).toBe(false);
    
    expect(execution).toHaveProperty('error');
    expect(execution.error).toContain('require is not defined');
  });

  test('should limit execution time', async () => {
    const infiniteLoopScript = `
      while(true) {
        // Infinite loop
      }
    `;

    const startTime = Date.now();
    const execution = await headlessRunner.executeScript(infiniteLoopScript, { timeout: 1000 });
    const executionTime = Date.now() - startTime;

    expect(execution.success).toBe(false);
    expect(execution.error).toContain('timeout');
    expect(executionTime).toBeLessThan(2000); // Should timeout within reasonable time
  });

  test('should provide DOM simulation', async () => {
    const domScript = `
      const element = document.createElement('div');
      element.innerHTML = 'Hello World';
      element.setAttribute('data-test', 'value');
      
      return {
        tagName: element.tagName,
        innerHTML: element.innerHTML,
        attribute: element.getAttribute('data-test')
      };
    `;

    const execution = await headlessRunner.executeScript(domScript);

    expect(execution.success).toBe(true);
    expect(execution.result.tagName).toBe('DIV');
    expect(execution.result.innerHTML).toBe('Hello World');
    expect(execution.result.attribute).toBe('value');
  });

  test('should simulate browser APIs', async () => {
    const apiScript = `
      const storage = {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        crypto: typeof crypto !== 'undefined'
      };
      
      return storage;
    `;

    const execution = await headlessRunner.executeScript(apiScript);

    expect(execution.success).toBe(true);
    expect(execution.result.localStorage).toBe(true);
    expect(execution.result.sessionStorage).toBe(true);
    expect(execution.result.fetch).toBe(true);
    expect(execution.result.crypto).toBe(true);
  });
});

describe('Probe Router API Tests', () => {
  test('should route HTTP probes correctly', async () => {
    const probeConfig = {
      type: 'http',
      target: 'https://example.com',
      method: 'GET',
      headers: {
        'User-Agent': 'MyDebugger/1.0',
        'Accept': 'application/json'
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      }),
      json: () => Promise.resolve({ message: 'success' })
    });

    const result = await probeRouter.executeProbe(probeConfig);

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
    
    expect(result).toHaveProperty('response');
    expect(result.response.status).toBe(200);
    expect(result.response.data.message).toBe('success');
  });

  test('should handle WebSocket probes', async () => {
    const probeConfig = {
      type: 'websocket',
      target: 'wss://echo.websocket.org',
      message: 'test message',
      timeout: 5000
    };

    // Mock WebSocket
    const mockWs = {
      readyState: 1,
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        if (event === 'open') {
          setTimeout(callback, 100);
        } else if (event === 'message') {
          setTimeout(() => callback({ data: 'test message' }), 200);
        }
      })
    };

    global.WebSocket = jest.fn(() => mockWs) as any;

    const result = await probeRouter.executeProbe(probeConfig);

    expect(result.success).toBe(true);
    expect(result.response.connected).toBe(true);
    expect(result.response.echo).toBe('test message');
  });

  test('should perform DNS probes', async () => {
    const probeConfig = {
      type: 'dns',
      target: 'example.com',
      recordType: 'A'
    };

    // Mock DNS resolution
    jest.doMock('dns', () => ({
      resolve: jest.fn((domain, type, callback) => {
        callback(null, ['93.184.216.34']);
      })
    }));

    const result = await probeRouter.executeProbe(probeConfig);

    expect(result.success).toBe(true);
    expect(result.response.records).toContain('93.184.216.34');
  });

  test('should handle SSL/TLS probes', async () => {
    const probeConfig = {
      type: 'ssl',
      target: 'example.com',
      port: 443
    };

    // Mock TLS connection
    jest.doMock('tls', () => ({
      connect: jest.fn((options, callback) => {
        const socket = {
          authorized: true,
          getPeerCertificate: () => ({
            subject: { CN: 'example.com' },
            issuer: { CN: 'DigiCert' },
            valid_from: '2024-01-01',
            valid_to: '2025-01-01'
          }),
          getProtocol: () => 'TLSv1.3',
          getCipher: () => ({
            name: 'TLS_AES_256_GCM_SHA384',
            version: 'TLSv1.3'
          })
        };
        callback(socket);
        return socket;
      })
    }));

    const result = await probeRouter.executeProbe(probeConfig);

    expect(result.success).toBe(true);
    expect(result.response.certificate.subject.CN).toBe('example.com');
    expect(result.response.protocol).toBe('TLSv1.3');
  });
});

describe('Utility Tools API Tests', () => {
  test('should compress images effectively', async () => {
    const mockImageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
    const imageBlob = new Blob([mockImageData], { type: 'image/png' });

    const compressed = await utilityTools.compressImage(imageBlob, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      format: 'jpeg'
    });

    expect(compressed).toBeInstanceOf(Blob);
    expect(compressed.type).toBe('image/jpeg');
    expect(compressed.size).toBeLessThanOrEqual(imageBlob.size);
  });

  test('should convert CSV to various formats', async () => {
    const csvData = 'Name,Age,City\nJohn,30,New York\nJane,25,London';
    
    const jsonResult = await utilityTools.convertCSV(csvData, 'json');
    expect(Array.isArray(jsonResult)).toBe(true);
    expect(jsonResult[0]).toHaveProperty('Name', 'John');
    expect(jsonResult[0]).toHaveProperty('Age', '30');
    
    const xmlResult = await utilityTools.convertCSV(csvData, 'xml');
    expect(typeof xmlResult).toBe('string');
    expect(xmlResult).toContain('<Name>John</Name>');
    
    const markdownResult = await utilityTools.convertCSV(csvData, 'markdown');
    expect(typeof markdownResult).toBe('string');
    expect(markdownResult).toContain('| Name | Age | City |');
  });

  test('should generate secure passwords', async () => {
    const password = utilityTools.generatePassword({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true
    });

    expect(password).toHaveLength(16);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[a-z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
    expect(/[!@#$%^&*]/.test(password)).toBe(true);
    expect(/[01lIO]/.test(password)).toBe(false); // Excluded similar characters
  });

  test('should validate input data comprehensively', async () => {
    const testCases = [
      {
        input: '<script>alert("xss")</script>',
        type: 'html',
        expected: { valid: false, issues: ['xss'] }
      },
      {
        input: "'; DROP TABLE users; --",
        type: 'sql',
        expected: { valid: false, issues: ['sql-injection'] }
      },
      {
        input: 'john@example.com',
        type: 'email',
        expected: { valid: true, issues: [] }
      },
      {
        input: 'https://example.com/path?param=value',
        type: 'url',
        expected: { valid: true, issues: [] }
      }
    ];

    for (const testCase of testCases) {
      const validation = utilityTools.validateInput(testCase.input, testCase.type);
      expect(validation.valid).toBe(testCase.expected.valid);
      if (!testCase.expected.valid) {
        expect(validation.issues.length).toBeGreaterThan(0);
      }
    }
  });

  test('should encode/decode various formats', async () => {
    const testData = 'Hello, World! 🌍';
    
    // Base64 encoding/decoding
    const base64Encoded = utilityTools.encode(testData, 'base64');
    const base64Decoded = utilityTools.decode(base64Encoded, 'base64');
    expect(base64Decoded).toBe(testData);
    
    // URL encoding/decoding
    const urlEncoded = utilityTools.encode(testData, 'url');
    const urlDecoded = utilityTools.decode(urlEncoded, 'url');
    expect(urlDecoded).toBe(testData);
    
    // HTML encoding/decoding
    const htmlData = '<div>Hello & "World"</div>';
    const htmlEncoded = utilityTools.encode(htmlData, 'html');
    expect(htmlEncoded).toContain('&lt;');
    expect(htmlEncoded).toContain('&amp;');
    expect(htmlEncoded).toContain('&quot;');
    
    const htmlDecoded = utilityTools.decode(htmlEncoded, 'html');
    expect(htmlDecoded).toBe(htmlData);
  });
});

describe('MyDebugger Core API Tests', () => {
  test('should initialize with correct configuration', async () => {
    const config = {
      maxConcurrentRequests: 5,
      requestTimeout: 15000,
      enableLogging: false,
      cacheEnabled: true
    };

    const api = new MyDebuggerAPI(config);
    
    expect(api.config.maxConcurrentRequests).toBe(5);
    expect(api.config.requestTimeout).toBe(15000);
    expect(api.config.enableLogging).toBe(false);
    expect(api.config.cacheEnabled).toBe(true);
  });

  test('should handle request queue management', async () => {
    const api = new MyDebuggerAPI({ maxConcurrentRequests: 2 });
    
    const requests = [
      api.makeRequest('GET', '/test1'),
      api.makeRequest('GET', '/test2'),
      api.makeRequest('GET', '/test3'), // Should be queued
      api.makeRequest('GET', '/test4')  // Should be queued
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true })
    });

    const results = await Promise.all(requests);
    
    expect(results).toHaveLength(4);
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });

  test('should implement request caching', async () => {
    const api = new MyDebuggerAPI({ cacheEnabled: true });
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'cached-response' })
    });

    // First request
    const result1 = await api.makeRequest('GET', '/cached-endpoint');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    
    // Second request should use cache
    const result2 = await api.makeRequest('GET', '/cached-endpoint');
    expect(mockFetch).toHaveBeenCalledTimes(1); // No additional fetch
    
    expect(result1).toEqual(result2);
  });

  test('should handle request timeouts', async () => {
    const api = new MyDebuggerAPI({ requestTimeout: 100 });
    
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 200))
    );

    const result = await api.makeRequest('GET', '/slow-endpoint');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('timeout');
  });

  test('should log requests when enabled', async () => {
    const api = new MyDebuggerAPI({ enableLogging: true });
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true })
    });

    await api.makeRequest('GET', '/logged-endpoint');
    
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('GET /logged-endpoint')
    );
  });

  test('should handle error responses gracefully', async () => {
    const api = new MyDebuggerAPI();
    
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ error: 'Resource not found' })
    });

    const result = await api.makeRequest('GET', '/nonexistent');
    
    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
    expect(result.error).toContain('Not Found');
  });
});

describe('Performance and Load Testing', () => {
  test('should handle high-volume concurrent requests', async () => {
    const api = new MyDebuggerAPI({ maxConcurrentRequests: 10 });
    
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      })
    );

    const startTime = Date.now();
    const requests = Array.from({ length: 100 }, (_, i) => 
      api.makeRequest('GET', `/test-${i}`)
    );

    const results = await Promise.all(requests);
    const duration = Date.now() - startTime;

    expect(results).toHaveLength(100);
    expect(results.every(r => r.success)).toBe(true);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should implement request rate limiting', async () => {
    const api = new MyDebuggerAPI({ 
      rateLimitRequests: 5,
      rateLimitWindow: 1000 
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true })
    });

    // Make 6 requests rapidly
    const requests = Array.from({ length: 6 }, (_, i) => 
      api.makeRequest('GET', `/rate-limited-${i}`)
    );

    const results = await Promise.all(requests);
    
    // First 5 should succeed, 6th should be rate limited
    expect(results.slice(0, 5).every(r => r.success)).toBe(true);
    expect(results[5].success).toBe(false);
    expect(results[5].error).toContain('rate limit');
  });

  test('should measure and report performance metrics', async () => {
    const api = new MyDebuggerAPI({ enableMetrics: true });
    
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true })
        }), 100)
      )
    );

    await api.makeRequest('GET', '/metrics-test');
    
    const metrics = api.getMetrics();
    
    expect(metrics).toHaveProperty('totalRequests');
    expect(metrics.totalRequests).toBe(1);
    
    expect(metrics).toHaveProperty('averageResponseTime');
    expect(metrics.averageResponseTime).toBeGreaterThan(90);
    expect(metrics.averageResponseTime).toBeLessThan(200);
    
    expect(metrics).toHaveProperty('successRate');
    expect(metrics.successRate).toBe(100);
  });
});

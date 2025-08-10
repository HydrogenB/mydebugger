/**
 * © 2025 MyDebugger Contributors – MIT License
 * Jest Test Configuration & Setup
 * Comprehensive testing environment setup for all test suites
 */

import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Fix Jest namespace issues
declare global {
  var jest: typeof import('@jest/globals')['jest'];
  var describe: typeof import('@jest/globals')['describe'];
  var test: typeof import('@jest/globals')['test'];
  var it: typeof import('@jest/globals')['it'];
  var expect: typeof import('@jest/globals')['expect'];
  var beforeAll: typeof import('@jest/globals')['beforeAll'];
  var afterAll: typeof import('@jest/globals')['afterAll'];
  var beforeEach: typeof import('@jest/globals')['beforeEach'];
  var afterEach: typeof import('@jest/globals')['afterEach'];
  
  // Browser API type extensions
  interface Navigator {
    bluetooth?: {
      requestDevice: (options?: any) => Promise<any>;
      getAvailability: () => Promise<boolean>;
    };
    usb?: {
      requestDevice: (options?: any) => Promise<any>;
      getDevices: () => Promise<any[]>;
    };
    wakeLock?: {
      request: (type: string) => Promise<any>;
    };
    share?: (data: any) => Promise<void>;
    canShare?: (data: any) => boolean;
  }

  interface Window {
    NDEFReader?: new () => {
      scan: () => Promise<void>;
      addEventListener: (event: string, handler: Function) => void;
    };
    showDirectoryPicker?: () => Promise<any>;
    showOpenFilePicker?: () => Promise<any>;
    showSaveFilePicker?: () => Promise<any>;
  }

  var NDEFReader: Window['NDEFReader'];
}

// Make Jest globals available
Object.assign(globalThis, {
  jest,
  describe: global.describe,
  test: global.test,
  it: global.it,
  expect: global.expect,
  beforeAll: global.beforeAll,
  afterAll: global.afterAll,
  beforeEach: global.beforeEach,
  afterEach: global.afterEach
});

// Enhanced mock implementations
export const createMockWebCrypto = () => ({
  getRandomValues: jest.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  subtle: {
    generateKey: jest.fn(() => Promise.resolve({
      privateKey: { type: 'private', algorithm: { name: 'RSA-PSS' } },
      publicKey: { type: 'public', algorithm: { name: 'RSA-PSS' } }
    })),
    sign: jest.fn(() => Promise.resolve(new ArrayBuffer(64))),
    verify: jest.fn(() => Promise.resolve(true)),
    importKey: jest.fn(() => Promise.resolve({ type: 'secret' })),
    exportKey: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
    encrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(48))),
    decrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
    digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32)))
  }
});

export const createMockMediaDevices = () => ({
  getUserMedia: jest.fn((constraints: MediaStreamConstraints) => Promise.resolve({
    getTracks: () => [{ 
      stop: jest.fn(), 
      kind: constraints.video ? 'video' : 'audio',
      enabled: true,
      readyState: 'live'
    }],
    getVideoTracks: () => constraints.video ? [{ stop: jest.fn(), enabled: true }] : [],
    getAudioTracks: () => constraints.audio ? [{ stop: jest.fn(), enabled: true }] : [],
    addTrack: jest.fn(),
    removeTrack: jest.fn(),
    clone: jest.fn()
  })),
  enumerateDevices: jest.fn(() => Promise.resolve([
    { deviceId: 'camera1', kind: 'videoinput', label: 'Front Camera', groupId: 'group1' },
    { deviceId: 'camera2', kind: 'videoinput', label: 'Back Camera', groupId: 'group1' },
    { deviceId: 'mic1', kind: 'audioinput', label: 'Built-in Microphone', groupId: 'group2' },
    { deviceId: 'speaker1', kind: 'audiooutput', label: 'Built-in Speakers', groupId: 'group3' }
  ])),
  getDisplayMedia: jest.fn(() => Promise.resolve({
    getTracks: () => [{ stop: jest.fn(), kind: 'video', enabled: true }],
    getVideoTracks: () => [{ stop: jest.fn(), enabled: true }]
  })),
  getSupportedConstraints: jest.fn(() => ({
    width: true,
    height: true,
    frameRate: true,
    facingMode: true,
    echoCancellation: true
  }))
});

export const createMockGeolocation = () => ({
  getCurrentPosition: jest.fn((success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) => {
    setTimeout(() => success({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitude: 100,
        altitudeAccuracy: 5,
        heading: 45,
        speed: 0
      },
      timestamp: Date.now()
    }), 100);
  }),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn()
});

export const createMockPermissions = () => ({
  query: jest.fn((descriptor: PermissionDescriptor) => Promise.resolve({
    state: 'granted' as PermissionState,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

export const createMockClipboard = () => ({
  readText: jest.fn(() => Promise.resolve('clipboard content')),
  writeText: jest.fn((text: string) => Promise.resolve()),
  read: jest.fn(() => Promise.resolve([{
    types: ['text/plain'],
    getType: (type: string) => Promise.resolve(new Blob(['test'], { type }))
  }])),
  write: jest.fn(() => Promise.resolve())
});

export const createMockServiceWorker = () => ({
  register: jest.fn((scriptURL: string, options?: RegistrationOptions) => Promise.resolve({
    scope: options?.scope || 'https://localhost/',
    active: { 
      postMessage: jest.fn(),
      scriptURL,
      state: 'activated'
    },
    waiting: null,
    installing: null,
    update: jest.fn(() => Promise.resolve()),
    unregister: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  getRegistration: jest.fn(() => Promise.resolve({
    scope: 'https://localhost/',
    unregister: jest.fn(() => Promise.resolve(true))
  })),
  getRegistrations: jest.fn(() => Promise.resolve([]))
});

export const createMockWakeLock = () => ({
  request: jest.fn((type: string) => Promise.resolve({
    type,
    released: false,
    release: jest.fn(() => Promise.resolve()),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});

export const createMockNotification = () => ({
  permission: 'granted' as NotificationPermission,
  requestPermission: jest.fn(() => Promise.resolve('granted' as NotificationPermission)),
  maxActions: 2
});

export const createMockWebSocket = () => jest.fn(() => ({
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  url: '',
  protocol: '',
  extensions: '',
  bufferedAmount: 0,
  binaryType: 'blob' as BinaryType,
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  onopen: null,
  onmessage: null,
  onclose: null,
  onerror: null
}));

export const createMockFetch = () => jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method || 'GET';
  
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    url,
    headers: new Headers({
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization',
      'strict-transport-security': 'max-age=31536000',
      'content-security-policy': "default-src 'self'",
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '1; mode=block',
      'referrer-policy': 'strict-origin-when-cross-origin'
    }),
    json: () => Promise.resolve({
      success: true,
      data: { message: `Response for ${method} ${url}` },
      timestamp: Date.now()
    }),
    text: () => Promise.resolve(`Text response for ${url}`),
    blob: () => Promise.resolve(new Blob(['mock data'], { type: 'application/octet-stream' })),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    formData: () => Promise.resolve(new FormData()),
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic' as ResponseType
  } as Response);
});

export const createMockStorage = () => {
  const storage = new Map<string, string>();
  
  return {
    getItem: jest.fn((key: string) => storage.get(key) || null),
    setItem: jest.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: jest.fn((key: string) => storage.delete(key)),
    clear: jest.fn(() => storage.clear()),
    get length() { return storage.size; },
    key: jest.fn((index: number) => Array.from(storage.keys())[index] || null)
  };
};

export const createMockFileReader = () => jest.fn(() => ({
  readAsDataURL: jest.fn(function(file: File) { 
    setTimeout(() => {
      (this as any).result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      (this as any).onload?.();
    }, 10);
  }),
  readAsText: jest.fn(function(file: File) {
    setTimeout(() => {
      (this as any).result = 'mock file content';
      (this as any).onload?.();
    }, 10);
  }),
  readAsArrayBuffer: jest.fn(function(file: File) {
    setTimeout(() => {
      (this as any).result = new ArrayBuffer(8);
      (this as any).onload?.();
    }, 10);
  }),
  readAsBinaryString: jest.fn(function(file: File) {
    setTimeout(() => {
      (this as any).result = 'binary string';
      (this as any).onload?.();
    }, 10);
  }),
  abort: jest.fn(),
  result: null,
  error: null,
  readyState: 0,
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
  onload: null,
  onerror: null,
  onprogress: null,
  onabort: null,
  onloadstart: null,
  onloadend: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

export const createMockCanvas = () => {
  const mockContext = {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    drawImage: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
    getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
    putImageData: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    arcTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    clip: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    setTransform: jest.fn(),
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    createPattern: jest.fn(),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0
  };

  HTMLCanvasElement.prototype.getContext = jest.fn((contextType: string) => {
    if (contextType === '2d') return mockContext;
    if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      return {
        ...mockContext,
        viewport: jest.fn(),
        clear: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        createShader: jest.fn(),
        createProgram: jest.fn(),
        useProgram: jest.fn()
      };
    }
    return null;
  });
  
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,test');
  HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
    setTimeout(() => callback(new Blob(['test'], { type: 'image/png' })), 10);
  });

  return mockContext;
};

export const createMockBluetooth = () => ({
  requestDevice: jest.fn((options?: any) => Promise.resolve({
    id: 'device-123',
    name: 'Test Bluetooth Device',
    gatt: {
      connected: false,
      connect: jest.fn(() => Promise.resolve({
        getPrimaryService: jest.fn(),
        getPrimaryServices: jest.fn(() => Promise.resolve([]))
      })),
      disconnect: jest.fn()
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  getAvailability: jest.fn(() => Promise.resolve(true)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
});

export const createMockUSB = () => ({
  requestDevice: jest.fn((options?: any) => Promise.resolve({
    vendorId: 0x1234,
    productId: 0x5678,
    productName: 'Test USB Device',
    manufacturerName: 'Test Manufacturer',
    serialNumber: 'TEST123',
    usbVersionMajor: 2,
    usbVersionMinor: 0,
    deviceClass: 0,
    deviceSubclass: 0,
    deviceProtocol: 0,
    configurations: [],
    open: jest.fn(() => Promise.resolve()),
    close: jest.fn(() => Promise.resolve()),
    claimInterface: jest.fn(() => Promise.resolve()),
    releaseInterface: jest.fn(() => Promise.resolve())
  })),
  getDevices: jest.fn(() => Promise.resolve([])),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
});

export const createMockNDEFReader = () => jest.fn(() => ({
  scan: jest.fn(() => Promise.resolve()),
  write: jest.fn(() => Promise.resolve()),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Global test setup function
export const setupTestEnvironment = () => {
  // Mock Web APIs
  Object.defineProperty(window, 'crypto', { value: createMockWebCrypto(), writable: true });
  Object.defineProperty(navigator, 'mediaDevices', { value: createMockMediaDevices(), writable: true });
  Object.defineProperty(navigator, 'geolocation', { value: createMockGeolocation(), writable: true });
  Object.defineProperty(navigator, 'permissions', { value: createMockPermissions(), writable: true });
  Object.defineProperty(navigator, 'clipboard', { value: createMockClipboard(), writable: true });
  Object.defineProperty(navigator, 'serviceWorker', { value: createMockServiceWorker(), writable: true });
  Object.defineProperty(navigator, 'wakeLock', { value: createMockWakeLock(), writable: true });
  Object.defineProperty(navigator, 'bluetooth', { value: createMockBluetooth(), writable: true });
  Object.defineProperty(navigator, 'usb', { value: createMockUSB(), writable: true });

  // Mock global constructors
  global.Notification = createMockNotification() as any;
  global.WebSocket = createMockWebSocket() as any;
  global.fetch = createMockFetch() as any;
  global.FileReader = createMockFileReader() as any;
  global.NDEFReader = createMockNDEFReader() as any;

  // Mock storage
  const mockLocalStorage = createMockStorage();
  const mockSessionStorage = createMockStorage();
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
  Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage, writable: true });

  // Mock canvas
  createMockCanvas();

  // Mock URL and URLSearchParams
  global.URL = class MockURL {
    constructor(public href: string, base?: string) {}
    toString() { return this.href; }
    static createObjectURL = jest.fn(() => 'blob:mock-url');
    static revokeObjectURL = jest.fn();
  } as any;

  global.URLSearchParams = class MockURLSearchParams {
    private params = new Map<string, string>();
    
    constructor(init?: string | string[][] | Record<string, string>) {
      if (typeof init === 'string') {
        // Parse query string
        init.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
        });
      }
    }
    
    get(name: string) { return this.params.get(name); }
    set(name: string, value: string) { this.params.set(name, value); }
    has(name: string) { return this.params.has(name); }
    delete(name: string) { this.params.delete(name); }
    toString() { 
      return Array.from(this.params.entries())
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    }
  } as any;

  // Mock performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn((type: string) => (type === 'navigation' ? [{ fetchStart: 0, loadEventEnd: 0, domContentLoadedEventEnd: 0 }] : [])),
      getEntriesByName: jest.fn(() => []),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
      memory: {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000
      }
    },
    writable: true
  });

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  })) as any;

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  })) as any;

  // Mock MutationObserver
  global.MutationObserver = jest.fn(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => [])
  })) as any;

  // Suppress console messages in tests
  const originalConsole = { ...console };
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };

  return {
    restore: () => {
      global.console = originalConsole;
    }
  };
};

// Run setup automatically when this module is imported
setupTestEnvironment();

export default setupTestEnvironment;

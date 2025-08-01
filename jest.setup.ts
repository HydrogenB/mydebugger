/**
 * © 2025 MyDebugger Contributors – MIT License
 * Jest Setup Configuration for World-Class Testing
 */

import '@testing-library/jest-dom';

// Mock global APIs that might not be available in test environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
  } as Response)
);

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  readyState: 1,
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
})) as any;

// Mock navigator APIs
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [{ stop: jest.fn() }],
      })
    ),
  },
});

Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn((callback: (position: any) => void) =>
      callback({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      })
    ),
  },
});

Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('test')),
  },
});

Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(() => Promise.resolve()),
  },
});

// Mock Notification API
global.Notification = {
  requestPermission: jest.fn(() => Promise.resolve('granted')),
} as any;

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock URL and URLSearchParams for older environments
if (!global.URL) {
  global.URL = class URL {
    constructor(public href: string) {}
    toString() { return this.href; }
  } as any;
}

if (!global.URLSearchParams) {
  global.URLSearchParams = class URLSearchParams {
    constructor(public params: string = '') {}
    get(key: string) { return null; }
    set(key: string, value: string) {}
    toString() { return this.params; }
  } as any;
}

// Silence console warnings in tests unless explicitly needed
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('Warning: ReactDOM.render is deprecated')) {
    return;
  }
  originalWarn.call(console, ...args);
};

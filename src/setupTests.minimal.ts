/**
 * © 2025 MyDebugger Contributors – MIT License
 * Minimal test setup for essential browser APIs
 */

// Essential DOM mocks for jsdom
if (typeof HTMLMediaElement !== 'undefined') {
  HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
  HTMLMediaElement.prototype.pause = jest.fn();
  HTMLMediaElement.prototype.load = jest.fn();
}

// Storage mocks with proper Map-based implementation
const createMockStorage = () => {
  const storage = new Map<string, string>();
  return {
    getItem: jest.fn((key: string) => storage.get(key) || null),
    setItem: jest.fn((key: string, value: string) => {
      storage.set(key, value);
      // Trigger storage event simulation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
    }),
    removeItem: jest.fn((key: string) => storage.delete(key)),
    clear: jest.fn(() => storage.clear()),
    get length() { return storage.size; },
    key: jest.fn((index: number) => Array.from(storage.keys())[index] || null),
  };
};

Object.defineProperty(window, 'localStorage', { 
  value: createMockStorage(), 
  writable: true 
});
Object.defineProperty(window, 'sessionStorage', { 
  value: createMockStorage(), 
  writable: true 
});

// Mock window.location for storage tests
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    href: 'http://localhost',
    protocol: 'http:',
  },
  writable: true,
});

// Basic crypto mock
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: jest.fn((arr) => arr),
    },
  });
}

// Canvas mock
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
}

// Media mock
global.URL = global.URL || {};
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

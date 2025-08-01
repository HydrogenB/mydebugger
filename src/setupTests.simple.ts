/**
 * © 2025 MyDebugger Contributors – MIT License
 * Test setup file with essential browser API mocks
 */

// Define HTMLMediaElement if not available
if (typeof HTMLMediaElement === 'undefined') {
  (global as any).HTMLMediaElement = function() {};
  HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
  HTMLMediaElement.prototype.pause = jest.fn();
  HTMLMediaElement.prototype.load = jest.fn();
} else {
  HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
  HTMLMediaElement.prototype.pause = jest.fn();
  HTMLMediaElement.prototype.load = jest.fn();
}

// Mock MediaRecorder
(global as any).MediaRecorder = function() {
  this.start = jest.fn();
  this.stop = jest.fn();
  this.state = 'inactive';
};
MediaRecorder.isTypeSupported = jest.fn(() => true);

// Mock ResizeObserver
(global as any).ResizeObserver = function() {
  this.observe = jest.fn();
  this.unobserve = jest.fn();
  this.disconnect = jest.fn();
};

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      encrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(16))),
      decrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(16))),
    },
    getRandomValues: jest.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});

// Mock storage with proper implementation
const createMockStorage = () => {
  const storage = new Map();
  return {
    getItem: jest.fn((key: string) => storage.get(key) || null),
    setItem: jest.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: jest.fn((key: string) => storage.delete(key)),
    clear: jest.fn(() => storage.clear()),
    get length() { return storage.size; },
    key: jest.fn((index: number) => Array.from(storage.keys())[index] || null),
  };
};

Object.defineProperty(window, 'localStorage', { value: createMockStorage() });
Object.defineProperty(window, 'sessionStorage', { value: createMockStorage() });

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock location - use delete and redefine approach
delete (window as any).location;
(window as any).location = {
  hostname: 'localhost',
  href: 'http://localhost',
  protocol: 'http:',
};

// Suppress deprecation warnings
const originalWarn = console.warn;
console.warn = jest.fn((message: string) => {
  if (!message.includes('deprecated') && !message.includes('React Router')) {
    originalWarn(message);
  }
});

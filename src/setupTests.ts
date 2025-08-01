/**
 * © 2025 MyDebugger Contributors – MIT License
 * Jest setup file for mocking browser APIs and global configurations
 */

// Mock HTMLMediaElement for jsdom environment
if (typeof HTMLMediaElement === 'undefined') {
  global.HTMLMediaElement = class MockHTMLMediaElement {
    static prototype = {
      play: jest.fn().mockImplementation(() => Promise.resolve()),
      pause: jest.fn(),
      load: jest.fn(),
    };
  } as any;
} else {
  // Mock HTMLMediaElement methods for jsdom
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    writable: true,
    value: jest.fn().mockImplementation(() => Promise.resolve()),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    writable: true,
    value: jest.fn(),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    writable: true,
    value: jest.fn(),
  });
}

// Basic browser API mocks for testing
Object.defineProperty(global, 'MediaRecorder', {
  value: class MockMediaRecorder {
    static isTypeSupported = jest.fn().mockReturnValue(true);
    start = jest.fn();
    stop = jest.fn();
    state = 'inactive';
  },
});

Object.defineProperty(global, 'ResizeObserver', {
  value: class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  },
});

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      encrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
      decrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
    },
    getRandomValues: jest.fn().mockImplementation((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});

// Mock localStorage
const storageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: storageMock });
Object.defineProperty(window, 'sessionStorage', { value: storageMock });

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Suppress React Router warnings
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = String(args[0] ?? '');
  if (message.includes('React Router') || message.includes('deprecated')) {
    return;
  }
  originalWarn.apply(console, args);
};

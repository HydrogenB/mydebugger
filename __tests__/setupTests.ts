/**
 * © 2025 MyDebugger Contributors – MIT License
 */

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.AudioContext
class MockAudioContext {
  createAnalyser() {
    return new MockAnalyser();
  }
  createMediaStreamSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }
  close() {}
  get state() { return 'running'; }
}

class MockAnalyser {
  fftSize = 256;
  getByteFrequencyData() {}
  get frequencyBinCount() {
    return 1024;
  }
}

// Mock MediaStream
class MockMediaStream {
  getTracks() {
    return [{
      stop: jest.fn(),
      getSettings: () => ({}),
    }];
  }
}

// Set up global mocks
global.AudioContext = MockAudioContext as any;
global.MediaStream = MockMediaStream as any;

// Mock requestAnimationFrame
const mockRequestAnimationFrame = (global as any).requestAnimationFrame = 
  (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 0);
  };

// Mock cancelAnimationFrame
const mockCancelAnimationFrame = (global as any).cancelAnimationFrame = 
  (id: number) => {
    clearTimeout(id);
  };

// Mock React Icons
jest.mock('react-icons/fa', () => ({
  FaGithub: 'FaGithub',
  FaLinkedin: 'FaLinkedin',
  FaFacebook: 'FaFacebook',
  FaPhone: 'FaPhone',
  FaEnvelope: 'FaEnvelope',
  FaGlobe: 'FaGlobe',
  FaMapMarkerAlt: 'FaMapMarkerAlt',
  FaDownload: 'FaDownload',
}));

// Mock react-icons/lu
jest.mock('react-icons/lu', () => ({
  LuMic: 'LuMic',
  LuMicOff: 'LuMicOff',
  LuSquare: 'LuSquare',
}));

// Mock react-icons/ri
jest.mock('react-icons/ri', () => ({
  RiStopCircleLine: 'RiStopCircleLine',
}));

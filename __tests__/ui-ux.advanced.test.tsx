/**
 * © 2025 MyDebugger Contributors – MIT License
 * Advanced UI/UX Component Integration Tests
 * Complete coverage for all React components and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Import all tool components for comprehensive testing
import JwtToolkit from '../src/tools/jwt/JwtToolkit';
import QRCodeGenerator from '../src/tools/qrcode/QRCodeGenerator';
import RegexTester from '../src/tools/regex/RegexTester';
import UrlEncoder from '../src/tools/url/UrlEncoder';
import HeadersAnalyzer from '../src/tools/headers/HeadersAnalyzer';
import DeviceTrace from '../src/tools/linktracer/DeviceTrace';
import JwtPlayground from '../src/tools/jwtplayground/JwtPlayground';

// Import view components
import PentestSuiteView from '../src/tools/pentest/components/PentestSuitePanel';
import PermissionTesterView from '../src/tools/permission-tester/components/PermissionTesterPanel';
import StayAwakeView from '../src/tools/stayawake/components/StayAwakePanel';
import QrscanView from '../src/tools/qrscan/components/QrscanPanel';
import StorageDebuggerView from '../src/tools/storage-sync/components/StorageDebuggerPanel';
import DeepLinkChainView from '../src/tools/deep-link-chain/components/DeepLinkChainPanel';

// Import preview components
// Legacy preview components not ported; skip their tests or mock if necessary
jest.mock('../view/DataPreview', () => ({
  CameraPreview: () => null,
  MicMeter: () => null,
  GeoPanel: () => null,
  SensorTable: () => null,
}), { virtual: true });
jest.mock('../view/DataPreview/BluetoothPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/ClipboardPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/HIDPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/MIDIPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/NFCPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/NotificationPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/ScreenWakeLockPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/SerialPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/SpeakerSelectionPreview', () => ({ __esModule: true, default: () => null }), { virtual: true });
jest.mock('../view/DataPreview/USBPreview', () => ({ __esModule: true, default: () => null }));

// Mock complex APIs and services
const mockWebCrypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  subtle: {
    generateKey: jest.fn(() => Promise.resolve({
      privateKey: { type: 'private' },
      publicKey: { type: 'public' }
    })),
    sign: jest.fn(() => Promise.resolve(new ArrayBuffer(64))),
    verify: jest.fn(() => Promise.resolve(true)),
    importKey: jest.fn(() => Promise.resolve({ type: 'secret' })),
    exportKey: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
    encrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(48))),
    decrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(32)))
  }
};

const mockMediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve({
    getTracks: () => [{ stop: jest.fn(), kind: 'video' }],
    getVideoTracks: () => [{ stop: jest.fn() }],
    getAudioTracks: () => [{ stop: jest.fn() }]
  })),
  enumerateDevices: jest.fn(() => Promise.resolve([
    { deviceId: 'camera1', kind: 'videoinput', label: 'Front Camera' },
    { deviceId: 'mic1', kind: 'audioinput', label: 'Built-in Microphone' },
    { deviceId: 'speaker1', kind: 'audiooutput', label: 'Built-in Speakers' }
  ])),
  getDisplayMedia: jest.fn(() => Promise.resolve({
    getTracks: () => [{ stop: jest.fn() }]
  }))
};

const mockGeolocation = {
  getCurrentPosition: jest.fn((success) => {
    setTimeout(() => success({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    }), 100);
  }),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn()
};

// Global setup for all tests
beforeAll(() => {
  // Mock Web APIs
  Object.defineProperty(window, 'crypto', { value: mockWebCrypto });
  Object.defineProperty(navigator, 'mediaDevices', { value: mockMediaDevices });
  Object.defineProperty(navigator, 'geolocation', { value: mockGeolocation });
  
  // Mock canvas and WebGL
  const mockCanvas = document.createElement('canvas');
  const mockContext = {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: jest.fn(),
    drawImage: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    fillText: jest.fn(),
    save: jest.fn(),
    restore: jest.fn()
  };
  
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,test');
  HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
    callback(new Blob(['test'], { type: 'image/png' }));
  });

  // Mock WebSocket
  global.WebSocket = jest.fn(() => ({
    readyState: 1,
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })) as any;

  // Mock File APIs
  global.FileReader = jest.fn(() => ({
    readAsDataURL: jest.fn(),
    readAsText: jest.fn(),
    readAsArrayBuffer: jest.fn(),
    result: 'mock-result',
    onload: null,
    onerror: null
  })) as any;

  // Mock fetch with comprehensive responses
  global.fetch = jest.fn((url, options) => {
    const method = options?.method || 'GET';
    const headers = new Headers({
      'content-type': 'application/json',
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff',
      'strict-transport-security': 'max-age=31536000'
    });

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers,
      json: () => Promise.resolve({
        success: true,
        data: { message: `Mock response for ${method} ${url}` }
      }),
      text: () => Promise.resolve(`Mock text response for ${url}`),
      blob: () => Promise.resolve(new Blob(['mock-blob'], { type: 'application/octet-stream' })),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
    });
  }) as jest.Mock;
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Advanced JWT Toolkit Tests', () => {
  test('should handle complete JWT workflow', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JwtToolkit />);

    // Test JWT decoding
    const tokenInput = screen.getByLabelText(/jwt token/i);
    const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await user.type(tokenInput, sampleJWT);
    
    await waitFor(() => {
      expect(screen.getByText(/header/i)).toBeInTheDocument();
      expect(screen.getByText(/payload/i)).toBeInTheDocument();
    });

    // Test signature verification
    const verifyButton = screen.getByText(/verify/i);
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(/signature/i)).toBeInTheDocument();
    });

    // Test security analysis
    expect(screen.getByText(/security/i)).toBeInTheDocument();
  });

  test('should handle JWT builder functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JwtToolkit />);

    // Switch to builder tab
    const builderTab = screen.getByText(/builder/i);
    await user.click(builderTab);

    // Test header configuration
    const algorithmSelect = screen.getByLabelText(/algorithm/i);
    await user.selectOptions(algorithmSelect, 'HS256');

    // Test payload configuration
    const subjectInput = screen.getByLabelText(/subject/i);
    await user.type(subjectInput, 'test-user');

    const audienceInput = screen.getByLabelText(/audience/i);
    await user.type(audienceInput, 'test-app');

    // Test token generation
    const generateButton = screen.getByText(/generate/i);
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/generated token/i)).toBeInTheDocument();
    });
  });

  test('should handle JWKS probe functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JwtToolkit />);

    // Switch to JWKS tab
    const jwksTab = screen.getByText(/jwks/i);
    await user.click(jwksTab);

    // Test JWKS URL input
    const jwksUrlInput = screen.getByLabelText(/jwks url/i);
    await user.type(jwksUrlInput, 'https://example.com/.well-known/jwks.json');

    const fetchButton = screen.getByText(/fetch/i);
    await user.click(fetchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/.well-known/jwks.json');
    });
  });
});

describe('Advanced QR Code Generator Tests', () => {
  test('should generate QR codes with custom styling', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QRCodeGenerator />);

    // Test text input
    const textInput = screen.getByLabelText(/text/i);
    await user.type(textInput, 'https://example.com/test');

    // Test size adjustment
    const sizeSlider = screen.getByLabelText(/size/i);
    fireEvent.change(sizeSlider, { target: { value: '300' } });

    // Test color customization
    const colorPicker = screen.getByLabelText(/foreground color/i);
    await user.type(colorPicker, '#ff0000');

    const backgroundColorPicker = screen.getByLabelText(/background color/i);
    await user.type(backgroundColorPicker, '#ffffff');

    // Test error correction level
    const errorCorrectionSelect = screen.getByLabelText(/error correction/i);
    await user.selectOptions(errorCorrectionSelect, 'H');

    // Generate QR code
    const generateButton = screen.getByText(/generate/i);
    await user.click(generateButton);

    await waitFor(() => {
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
    });

    // Test download functionality
    const downloadButton = screen.getByText(/download/i);
    await user.click(downloadButton);
  });

  test('should handle batch QR code generation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QRCodeGenerator />);

    // Switch to batch mode
    const batchModeTab = screen.getByText(/batch/i);
    await user.click(batchModeTab);

    // Test CSV input for batch generation
    const csvInput = screen.getByLabelText(/csv data/i);
    const csvData = 'URL,Label\nhttps://example.com,Example\nhttps://test.com,Test';
    await user.type(csvInput, csvData);

    const generateBatchButton = screen.getByText(/generate batch/i);
    await user.click(generateBatchButton);

    await waitFor(() => {
      expect(screen.getByText(/batch generation complete/i)).toBeInTheDocument();
    });
  });
});

describe('Advanced Regex Tester Tests', () => {
  test('should test regex patterns with full functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegexTester />);

    // Test pattern input
    const patternInput = screen.getByLabelText(/pattern/i);
    await user.type(patternInput, '\\b\\w+@\\w+\\.\\w+\\b');

    // Test flags
    const globalFlag = screen.getByLabelText(/global/i);
    const caseInsensitiveFlag = screen.getByLabelText(/case insensitive/i);
    await user.click(globalFlag);
    await user.click(caseInsensitiveFlag);

    // Test input text
    const testTextInput = screen.getByLabelText(/test text/i);
    const testText = 'Contact us at john@example.com or support@test.org';
    await user.type(testTextInput, testText);

    // Execute test
    const testButton = screen.getByText(/test/i);
    await user.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/matches found/i)).toBeInTheDocument();
    });

    // Test replace functionality
    const replacementInput = screen.getByLabelText(/replacement/i);
    await user.type(replacementInput, '[EMAIL]');

    const replaceButton = screen.getByText(/replace/i);
    await user.click(replaceButton);

    await waitFor(() => {
      expect(screen.getByText(/replacement result/i)).toBeInTheDocument();
    });
  });

  test('should provide regex cheat sheet and examples', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegexTester />);

    // Test cheat sheet toggle
    const cheatSheetButton = screen.getByText(/cheat sheet/i);
    await user.click(cheatSheetButton);

    expect(screen.getByText(/character classes/i)).toBeInTheDocument();
    expect(screen.getByText(/quantifiers/i)).toBeInTheDocument();

    // Test example patterns
    const examplesButton = screen.getByText(/examples/i);
    await user.click(examplesButton);

    const emailExampleButton = screen.getByText(/email/i);
    await user.click(emailExampleButton);

    await waitFor(() => {
      const patternInput = screen.getByLabelText(/pattern/i);
      expect(patternInput).toHaveValue();
    });
  });
});

describe('Advanced Permission Tester Tests', () => {
  test('should test all browser permissions comprehensively', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PermissionTesterView />);

    // Test camera permission
    const cameraButton = screen.getByText(/test camera/i);
    await user.click(cameraButton);

    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    });

    // Test microphone permission
    const micButton = screen.getByText(/test microphone/i);
    await user.click(micButton);

    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    // Test geolocation permission
    const geoButton = screen.getByText(/test location/i);
    await user.click(geoButton);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    // Test notification permission
    const notifButton = screen.getByText(/test notifications/i);
    await user.click(notifButton);

    // Test clipboard permission
    const clipboardButton = screen.getByText(/test clipboard/i);
    await user.click(clipboardButton);
  });

  test('should display permission results with detailed information', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PermissionTesterView />);

    // Test comprehensive permission overview
    const overviewButton = screen.getByText(/permission overview/i);
    await user.click(overviewButton);

    await waitFor(() => {
      expect(screen.getByText(/camera/i)).toBeInTheDocument();
      expect(screen.getByText(/microphone/i)).toBeInTheDocument();
      expect(screen.getByText(/location/i)).toBeInTheDocument();
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    });
  });
});

describe('Advanced Device Preview Components Tests', () => {
  test('should render camera preview with controls', async () => {
    const user = userEvent.setup();
    const mockOnStop = jest.fn();
    renderWithProviders(<CameraPreview onStop={mockOnStop} />);

    // Test camera initialization
    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    });

    // Test camera controls
    const stopButton = screen.getByText(/stop/i);
    await user.click(stopButton);

    expect(mockOnStop).toHaveBeenCalled();
  });

  test('should render microphone meter with audio levels', async () => {
    const user = userEvent.setup();
    const mockOnStop = jest.fn();
    renderWithProviders(<MicMeter onStop={mockOnStop} />);

    // Test microphone access
    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    // Test audio level visualization
    expect(screen.getByText(/audio level/i)).toBeInTheDocument();
  });

  test('should render geolocation panel with coordinates', async () => {
    const user = userEvent.setup();
    const mockOnStop = jest.fn();
    renderWithProviders(<GeoPanel onStop={mockOnStop} />);

    // Test geolocation access
    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    // Test coordinate display
    await waitFor(() => {
      expect(screen.getByText(/latitude/i)).toBeInTheDocument();
      expect(screen.getByText(/longitude/i)).toBeInTheDocument();
    });
  });

  test('should render Bluetooth preview with device scanning', async () => {
    const user = userEvent.setup();
    const mockOnStop = jest.fn();
    
    // Mock Bluetooth API
    const mockBluetooth = {
      requestDevice: jest.fn(() => Promise.resolve({
        id: 'device-1',
        name: 'Test Device',
        gatt: { connected: false }
      })),
      getAvailability: jest.fn(() => Promise.resolve(true))
    };
    
    Object.defineProperty(navigator, 'bluetooth', { value: mockBluetooth });
    
    renderWithProviders(<BluetoothPreview onStop={mockOnStop} />);

    const scanButton = screen.getByText(/scan/i);
    await user.click(scanButton);

    await waitFor(() => {
      expect(mockBluetooth.requestDevice).toHaveBeenCalled();
    });
  });

  test('should render USB preview with device management', async () => {
    const user = userEvent.setup();
    const mockOnStop = jest.fn();
    
    // Mock USB API
    const mockUSB = {
      requestDevice: jest.fn(() => Promise.resolve({
        vendorId: 0x1234,
        productId: 0x5678,
        productName: 'Test USB Device'
      })),
      getDevices: jest.fn(() => Promise.resolve([]))
    };
    
    Object.defineProperty(navigator, 'usb', { value: mockUSB });
    
    renderWithProviders(<USBPreview onStop={mockOnStop} />);

    const requestButton = screen.getByText(/request device/i);
    await user.click(requestButton);

    await waitFor(() => {
      expect(mockUSB.requestDevice).toHaveBeenCalled();
    });
  });

  test('should render NFC preview with tag reading', async () => {
    const user = userEvent.setup();
    const mockOnStop = jest.fn();
    
    // Mock NFC API
    global.NDEFReader = jest.fn(() => ({
      scan: jest.fn(() => Promise.resolve()),
      addEventListener: jest.fn()
    })) as any;
    
    renderWithProviders(<NFCPreview onStop={mockOnStop} />);

    const scanButton = screen.getByText(/start scanning/i);
    await user.click(scanButton);

    await waitFor(() => {
      expect(global.NDEFReader).toHaveBeenCalled();
    });
  });
});

describe('Advanced WebSocket Simulator Tests', () => {
  test('should handle WebSocket connection and messaging', async () => {
    const user = userEvent.setup();
    const mockProps = {
      url: 'ws://localhost:8080',
      connected: false,
      messages: [],
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendMessage: jest.fn(),
      clearMessages: jest.fn()
    };
    
    renderWithProviders(<WebsocketSimulatorView {...mockProps} />);

    // Test URL input
    const urlInput = screen.getByLabelText(/websocket url/i);
    await user.clear(urlInput);
    await user.type(urlInput, 'wss://echo.websocket.org');

    // Test connection
    const connectButton = screen.getByText(/connect/i);
    await user.click(connectButton);

    expect(mockProps.connect).toHaveBeenCalled();

    // Test message sending
    const messageInput = screen.getByLabelText(/message/i);
    await user.type(messageInput, 'Test message');

    const sendButton = screen.getByText(/send/i);
    await user.click(sendButton);

    expect(mockProps.sendMessage).toHaveBeenCalledWith('Test message');
  });

  test('should handle WebSocket connection profiles', async () => {
    const user = userEvent.setup();
    const mockProps = {
      url: '',
      connected: false,
      messages: [],
      profiles: [
        { name: 'Echo Server', url: 'wss://echo.websocket.org' },
        { name: 'Local Server', url: 'ws://localhost:8080' }
      ],
      loadProfile: jest.fn(),
      saveProfile: jest.fn(),
      deleteProfile: jest.fn()
    };
    
    renderWithProviders(<WebsocketSimulatorView {...mockProps} />);

    // Test profile selection
    const profileSelect = screen.getByLabelText(/profile/i);
    await user.selectOptions(profileSelect, 'Echo Server');

    expect(mockProps.loadProfile).toHaveBeenCalledWith('Echo Server');

    // Test profile saving
    const saveProfileButton = screen.getByText(/save profile/i);
    await user.click(saveProfileButton);

    const profileNameInput = screen.getByLabelText(/profile name/i);
    await user.type(profileNameInput, 'My Custom Profile');

    const confirmSaveButton = screen.getByText(/confirm save/i);
    await user.click(confirmSaveButton);

    expect(mockProps.saveProfile).toHaveBeenCalledWith('My Custom Profile');
  });
});

describe('Advanced Storage Debugger Tests', () => {
  test('should handle storage inspection and manipulation', async () => {
    const user = userEvent.setup();
    const mockProps = {
      storageType: 'localStorage' as const,
      items: [
        { key: 'user-pref', value: '{"theme":"dark"}', size: 18 },
        { key: 'auth-token', value: 'abc123', size: 6 }
      ],
      totalSize: 24,
      setStorageType: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearStorage: jest.fn(),
      exportData: jest.fn(),
      importData: jest.fn()
    };
    
    renderWithProviders(<StorageDebuggerView {...mockProps} />);

    // Test storage type switching
    const sessionStorageTab = screen.getByText(/session storage/i);
    await user.click(sessionStorageTab);

    expect(mockProps.setStorageType).toHaveBeenCalledWith('sessionStorage');

    // Test adding new item
    const addButton = screen.getByText(/add item/i);
    await user.click(addButton);

    const keyInput = screen.getByLabelText(/key/i);
    await user.type(keyInput, 'new-setting');

    const valueInput = screen.getByLabelText(/value/i);
    await user.type(valueInput, 'test-value');

    const saveButton = screen.getByText(/save/i);
    await user.click(saveButton);

    expect(mockProps.addItem).toHaveBeenCalledWith('new-setting', 'test-value');

    // Test item editing
    const editButtons = screen.getAllByText(/edit/i);
    await user.click(editButtons[0]);

    const updatedValueInput = screen.getByDisplayValue('{"theme":"dark"}');
    await user.clear(updatedValueInput);
    await user.type(updatedValueInput, '{"theme":"light"}');

    const updateButton = screen.getByText(/update/i);
    await user.click(updateButton);

    expect(mockProps.updateItem).toHaveBeenCalled();
  });

  test('should handle storage export and import', async () => {
    const user = userEvent.setup();
    const mockProps = {
      storageType: 'localStorage' as const,
      items: [],
      totalSize: 0,
      exportData: jest.fn(),
      importData: jest.fn()
    };
    
    renderWithProviders(<StorageDebuggerView {...mockProps} />);

    // Test export functionality
    const exportButton = screen.getByText(/export/i);
    await user.click(exportButton);

    expect(mockProps.exportData).toHaveBeenCalled();

    // Test import functionality
    const importButton = screen.getByText(/import/i);
    await user.click(importButton);

    const fileInput = screen.getByLabelText(/choose file/i);
    const file = new File(['{"key":"value"}'], 'storage.json', { type: 'application/json' });
    
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(mockProps.importData).toHaveBeenCalled();
    });
  });
});

describe('Advanced Stay Awake Tests', () => {
  test('should handle screen wake lock functionality', async () => {
    const user = userEvent.setup();
    
    // Mock Wake Lock API
    const mockWakeLock = {
      request: jest.fn(() => Promise.resolve({
        type: 'screen',
        released: false,
        release: jest.fn()
      }))
    };
    
    Object.defineProperty(navigator, 'wakeLock', { value: mockWakeLock });
    
    const mockProps = {
      supported: true,
      running: false,
      startTime: null,
      elapsedTime: 0,
      toggle: jest.fn(),
      getStats: jest.fn(() => ({
        totalSessions: 5,
        totalTime: 3600000,
        averageSession: 720000
      }))
    };
    
    renderWithProviders(<StayAwakeView {...mockProps} />);

    // Test wake lock activation
    const toggleButton = screen.getByText(/keep awake/i);
    await user.click(toggleButton);

    expect(mockProps.toggle).toHaveBeenCalled();

    // Test statistics display
    const statsButton = screen.getByText(/statistics/i);
    await user.click(statsButton);

    await waitFor(() => {
      expect(screen.getByText(/total sessions/i)).toBeInTheDocument();
      expect(screen.getByText(/total time/i)).toBeInTheDocument();
    });
  });

  test('should handle different wake lock types', async () => {
    const user = userEvent.setup();
    
    const mockProps = {
      supported: true,
      running: false,
      wakeLockType: 'screen' as const,
      setWakeLockType: jest.fn(),
      toggle: jest.fn()
    };
    
    renderWithProviders(<StayAwakeView {...mockProps} />);

    // Test wake lock type selection
    const typeSelect = screen.getByLabelText(/wake lock type/i);
    await user.selectOptions(typeSelect, 'system');

    expect(mockProps.setWakeLockType).toHaveBeenCalledWith('system');
  });
});

describe('Advanced Pentest Suite Tests', () => {
  test('should handle comprehensive security testing', async () => {
    const user = userEvent.setup();
    const mockProps = {
      target: '',
      isScanning: false,
      results: {},
      windowStates: [],
      payloadTests: [],
      setTarget: jest.fn(),
      startScan: jest.fn(),
      stopScan: jest.fn(),
      testHttps: jest.fn(),
      testHeaders: jest.fn(),
      testCors: jest.fn(),
      testClickjacking: jest.fn(),
      openPayloadWindow: jest.fn()
    };
    
    renderWithProviders(<PentestSuiteView {...mockProps} />);

    // Test target input
    const targetInput = screen.getByLabelText(/target url/i);
    await user.type(targetInput, 'https://example.com');

    expect(mockProps.setTarget).toHaveBeenCalledWith('https://example.com');

    // Test HTTPS testing
    const httpsTestButton = screen.getByText(/test https/i);
    await user.click(httpsTestButton);

    expect(mockProps.testHttps).toHaveBeenCalled();

    // Test header analysis
    const headerTestButton = screen.getByText(/test headers/i);
    await user.click(headerTestButton);

    expect(mockProps.testHeaders).toHaveBeenCalled();

    // Test CORS testing
    const corsTestButton = screen.getByText(/test cors/i);
    await user.click(corsTestButton);

    expect(mockProps.testCors).toHaveBeenCalled();

    // Test clickjacking detection
    const clickjackingTestButton = screen.getByText(/test clickjacking/i);
    await user.click(clickjackingTestButton);

    expect(mockProps.testClickjacking).toHaveBeenCalled();
  });

  test('should handle payload testing', async () => {
    const user = userEvent.setup();
    const mockProps = {
      payloadTests: [
        { id: '1', name: 'XSS Test', payload: '<script>alert(1)</script>', status: 'pending' },
        { id: '2', name: 'SQL Injection', payload: "'; DROP TABLE users; --", status: 'completed' }
      ],
      addPayloadTest: jest.fn(),
      runPayloadTest: jest.fn(),
      removePayloadTest: jest.fn()
    };
    
    renderWithProviders(<PentestSuiteView {...mockProps} />);

    // Test custom payload addition
    const addPayloadButton = screen.getByText(/add payload/i);
    await user.click(addPayloadButton);

    const payloadNameInput = screen.getByLabelText(/payload name/i);
    await user.type(payloadNameInput, 'Custom XSS');

    const payloadInput = screen.getByLabelText(/payload content/i);
    await user.type(payloadInput, '<img src=x onerror=alert(1)>');

    const savePayloadButton = screen.getByText(/save payload/i);
    await user.click(savePayloadButton);

    expect(mockProps.addPayloadTest).toHaveBeenCalledWith('Custom XSS', '<img src=x onerror=alert(1)>');

    // Test payload execution
    const runButtons = screen.getAllByText(/run/i);
    await user.click(runButtons[0]);

    expect(mockProps.runPayloadTest).toHaveBeenCalledWith('1');
  });
});

describe('Advanced QR Scanner Tests', () => {
  test('should handle QR code scanning with camera', async () => {
    const user = userEvent.setup();
    const mockProps = {
      isScanning: false,
      result: null,
      error: null,
      startScanning: jest.fn(),
      stopScanning: jest.fn(),
      clearResult: jest.fn()
    };
    
    renderWithProviders(<QrscanView {...mockProps} />);

    // Test scanning start
    const startButton = screen.getByText(/start scanning/i);
    await user.click(startButton);

    expect(mockProps.startScanning).toHaveBeenCalled();

    // Test camera permissions
    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    });

    // Test scanning stop
    const stopButton = screen.getByText(/stop scanning/i);
    await user.click(stopButton);

    expect(mockProps.stopScanning).toHaveBeenCalled();
  });

  test('should handle file upload for QR scanning', async () => {
    const user = userEvent.setup();
    const mockProps = {
      isScanning: false,
      result: null,
      scanFromFile: jest.fn()
    };
    
    renderWithProviders(<QrscanView {...mockProps} />);

    // Test file upload
    const fileInput = screen.getByLabelText(/upload image/i);
    const file = new File(['fake-image-data'], 'qr-code.png', { type: 'image/png' });
    
    await user.upload(fileInput, file);

    expect(mockProps.scanFromFile).toHaveBeenCalledWith(file);
  });
});

describe('Integration Test - Complete User Workflows', () => {
  test('should handle end-to-end JWT workflow', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JwtToolkit />);

    // 1. Decode existing token
    const tokenInput = screen.getByLabelText(/jwt token/i);
    await user.type(tokenInput, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

    // 2. Verify signature
    const secretInput = screen.getByLabelText(/secret/i);
    await user.type(secretInput, 'your-256-bit-secret');

    const verifyButton = screen.getByText(/verify/i);
    await user.click(verifyButton);

    // 3. Analyze security
    await waitFor(() => {
      expect(screen.getByText(/security analysis/i)).toBeInTheDocument();
    });

    // 4. Build new token
    const builderTab = screen.getByText(/builder/i);
    await user.click(builderTab);

    const subjectInput = screen.getByLabelText(/subject/i);
    await user.type(subjectInput, 'new-user');

    const generateButton = screen.getByText(/generate/i);
    await user.click(generateButton);

    // 5. Export results
    const exportButton = screen.getByText(/export/i);
    await user.click(exportButton);
  });

  test('should handle complete security testing workflow', async () => {
    const user = userEvent.setup();
    
    // 1. Start with header scanning
    renderWithProviders(<HeadersAnalyzer />);
    
    const urlInput = screen.getByLabelText(/url/i);
    await user.type(urlInput, 'https://example.com');
    
    const scanButton = screen.getByText(/scan/i);
    await user.click(scanButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://example.com');
    });

    // 2. Move to permission testing
    renderWithProviders(<PermissionTesterView />);
    
    const cameraTestButton = screen.getByText(/test camera/i);
    await user.click(cameraTestButton);

    // 3. Finish with pentest suite
    const pentestProps = {
      target: 'https://example.com',
      isScanning: false,
      results: {},
      startScan: jest.fn()
    };
    
    renderWithProviders(<PentestSuiteView {...pentestProps} />);
    
    const startScanButton = screen.getByText(/start scan/i);
    await user.click(startScanButton);

    expect(pentestProps.startScan).toHaveBeenCalled();
  });
});

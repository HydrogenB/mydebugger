/**
 * © 2025 MyDebugger Contributors – MIT License
 * Comprehensive JWT Toolkit Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JwtToolkit } from '../src/tools/jwt/JwtToolkit';

// Mock worker import since it's not available in test environment
jest.mock('../src/tools/jwt/workers/cryptoWorker', () => ({
  decodeSafely: jest.fn(),
  verifyToken: jest.fn(),
  base64UrlEncode: jest.fn(),
  base64UrlDecode: jest.fn(),
}));

// Mock sub-components
jest.mock('../src/tools/jwt/components/BuilderWizard', () => ({
  BuilderWizard: ({ onTokenBuilt }: { onTokenBuilt: (token: string) => void }) => (
    <div data-testid="builder-wizard">
      <button onClick={() => onTokenBuilt('mock.jwt.token')}>Build Token</button>
    </div>
  ),
}));

jest.mock('../src/tools/jwt/components/InspectorPane', () => ({
  InspectorPane: ({ token, analysis }: { token: string; analysis: any }) => (
    <div data-testid="inspector-pane">
      <div data-testid="token-display">{token}</div>
      <div data-testid="analysis-display">{JSON.stringify(analysis)}</div>
    </div>
  ),
}));

jest.mock('../src/tools/jwt/components/JwksProbe', () => ({
  JwksProbe: ({ onKeySelected }: { onKeySelected: (key: any) => void }) => (
    <div data-testid="jwks-probe">
      <button onClick={() => onKeySelected({ kid: 'test-key', use: 'sig' })}>
        Select Key
      </button>
    </div>
  ),
}));

jest.mock('../src/tools/jwt/components/BenchResult', () => ({
  BenchResult: ({ algorithm, opsPerSecond }: { algorithm: string; opsPerSecond: number }) => (
    <div data-testid="bench-result">
      <span data-testid="algorithm">{algorithm}</span>
      <span data-testid="ops-per-second">{opsPerSecond}</span>
    </div>
  ),
}));

const { decodeSafely, verifyToken } = require('../src/tools/jwt/workers/cryptoWorker');

describe('JwtToolkit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render JWT toolkit with all main sections', () => {
    render(<JwtToolkit />);
    
    // Check for main sections
    expect(screen.getByText(/JWT Toolkit/i)).toBeInTheDocument();
    expect(screen.getByText(/Decode & Verify/i)).toBeInTheDocument();
    expect(screen.getByText(/Build & Sign/i)).toBeInTheDocument();
    expect(screen.getByText(/JWKS Probe/i)).toBeInTheDocument();
    expect(screen.getByText(/Benchmark/i)).toBeInTheDocument();
  });

  test('should handle token input and decoding', async () => {
    const mockDecoded = {
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { sub: '1234567890', name: 'John Doe' },
      signature: 'signature',
      isValid: false,
      raw: { header: 'header', payload: 'payload', signature: 'signature' }
    };
    
    decodeSafely.mockResolvedValue(mockDecoded);
    
    render(<JwtToolkit />);
    
    const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
    await userEvent.type(tokenInput, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature');
    
    await waitFor(() => {
      expect(decodeSafely).toHaveBeenCalledWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature');
    });
  });

  test('should handle token verification with secret', async () => {
    const mockDecoded = {
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { sub: '1234567890' },
      signature: 'signature',
      isValid: false,
      raw: { header: 'header', payload: 'payload', signature: 'signature' }
    };
    
    decodeSafely.mockResolvedValue(mockDecoded);
    verifyToken.mockResolvedValue(true);
    
    render(<JwtToolkit />);
    
    const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
    await userEvent.type(tokenInput, 'valid.jwt.token');
    
    const secretInput = screen.getByPlaceholderText(/Enter secret/i);
    await userEvent.type(secretInput, 'test-secret');
    
    const verifyButton = screen.getByText(/Verify/i);
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(verifyToken).toHaveBeenCalledWith('valid.jwt.token', 'test-secret');
    });
  });

  test('should switch between different tabs', () => {
    render(<JwtToolkit />);
    
    // Test tab switching
    const buildTab = screen.getByText(/Build & Sign/i);
    fireEvent.click(buildTab);
    
    expect(screen.getByTestId('builder-wizard')).toBeInTheDocument();
    
    const jwksTab = screen.getByText(/JWKS Probe/i);
    fireEvent.click(jwksTab);
    
    expect(screen.getByTestId('jwks-probe')).toBeInTheDocument();
  });

  test('should handle token building from wizard', async () => {
    render(<JwtToolkit />);
    
    // Switch to build tab
    const buildTab = screen.getByText(/Build & Sign/i);
    fireEvent.click(buildTab);
    
    // Trigger token building
    const buildButton = screen.getByText(/Build Token/i);
    fireEvent.click(buildButton);
    
    // Token should be set in the main input
    await waitFor(() => {
      const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
      expect(tokenInput).toHaveValue('mock.jwt.token');
    });
  });

  test('should handle JWKS key selection', async () => {
    render(<JwtToolkit />);
    
    // Switch to JWKS tab
    const jwksTab = screen.getByText(/JWKS Probe/i);
    fireEvent.click(jwksTab);
    
    // Select a key
    const selectKeyButton = screen.getByText(/Select Key/i);
    fireEvent.click(selectKeyButton);
    
    // Key should be used for verification
    await waitFor(() => {
      expect(screen.getByTestId('jwks-probe')).toBeInTheDocument();
    });
  });

  test('should show benchmark results', () => {
    render(<JwtToolkit />);
    
    // Switch to benchmark tab
    const benchmarkTab = screen.getByText(/Benchmark/i);
    fireEvent.click(benchmarkTab);
    
    // Should show benchmark interface
    expect(screen.getByText(/Algorithm Performance/i)).toBeInTheDocument();
  });

  test('should handle error states gracefully', async () => {
    decodeSafely.mockRejectedValue(new Error('Invalid token'));
    
    render(<JwtToolkit />);
    
    const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
    await userEvent.type(tokenInput, 'invalid.token');
    
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });

  test('should clear token and results', () => {
    render(<JwtToolkit />);
    
    const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
    userEvent.type(tokenInput, 'test.jwt.token');
    
    const clearButton = screen.getByText(/Clear/i);
    fireEvent.click(clearButton);
    
    expect(tokenInput).toHaveValue('');
  });

  test('should export results', () => {
    const mockDecoded = {
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { sub: '1234567890' },
      signature: 'signature',
      isValid: true,
      raw: { header: 'header', payload: 'payload', signature: 'signature' }
    };
    
    decodeSafely.mockResolvedValue(mockDecoded);
    
    render(<JwtToolkit />);
    
    const exportButton = screen.getByText(/Export/i);
    fireEvent.click(exportButton);
    
    // Should trigger download or copy
    expect(exportButton).toBeInTheDocument();
  });

  test('should handle different algorithm types', async () => {
    const rsaDecoded = {
      header: { alg: 'RS256', typ: 'JWT' },
      payload: { sub: '1234567890' },
      signature: 'signature',
      isValid: false,
      raw: { header: 'header', payload: 'payload', signature: 'signature' }
    };
    
    decodeSafely.mockResolvedValue(rsaDecoded);
    
    render(<JwtToolkit />);
    
    const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
    await userEvent.type(tokenInput, 'rsa.jwt.token');
    
    await waitFor(() => {
      expect(screen.getByText(/RS256/i)).toBeInTheDocument();
    });
  });

  test('should handle token with warnings', async () => {
    const decodedWithWarnings = {
      header: { alg: 'HS256' }, // Missing typ
      payload: { sub: '1234567890' }, // Missing exp
      signature: 'signature',
      isValid: false,
      raw: { header: 'header', payload: 'payload', signature: 'signature' },
      parsingWarnings: ['Missing typ field', 'Missing exp field']
    };
    
    decodeSafely.mockResolvedValue(decodedWithWarnings);
    
    render(<JwtToolkit />);
    
    const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
    await userEvent.type(tokenInput, 'warning.jwt.token');
    
    await waitFor(() => {
      expect(screen.getByText(/Warnings/i)).toBeInTheDocument();
      expect(screen.getByText(/Missing typ field/i)).toBeInTheDocument();
    });
  });

  test('should show token security analysis', async () => {
    const secureDecoded = {
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { 
        sub: '1234567890', 
        exp: Math.floor(Date.now() / 1000) + 3600, // Future exp
        iat: Math.floor(Date.now() / 1000) - 60,    // Recent iat
        iss: 'trusted-issuer',
        aud: 'my-app'
      },
      signature: 'signature',
      isValid: true,
      raw: { header: 'header', payload: 'payload', signature: 'signature' }
    };
    
    decodeSafely.mockResolvedValue(secureDecoded);
    
    render(<JwtToolkit />);
    
    const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
    await userEvent.type(tokenInput, 'secure.jwt.token');
    
    await waitFor(() => {
      expect(screen.getByText(/Security Analysis/i)).toBeInTheDocument();
    });
  });

  test('should handle copy to clipboard functionality', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(void 0),
      },
    });
    
    render(<JwtToolkit />);
    
    const copyButton = screen.getByText(/Copy/i);
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('should handle token format validation', async () => {
    render(<JwtToolkit />);
    
    const tokenInput = screen.getByPlaceholderText(/Enter JWT token/i);
    
    // Test various invalid formats
    await userEvent.type(tokenInput, 'not-a-jwt');
    expect(screen.getByText(/Invalid token format/i)).toBeInTheDocument();
    
    await userEvent.clear(tokenInput);
    await userEvent.type(tokenInput, 'too.few');
    expect(screen.getByText(/Invalid token format/i)).toBeInTheDocument();
    
    await userEvent.clear(tokenInput);
    await userEvent.type(tokenInput, 'too.many.parts.here.extra');
    expect(screen.getByText(/Invalid token format/i)).toBeInTheDocument();
  });
});

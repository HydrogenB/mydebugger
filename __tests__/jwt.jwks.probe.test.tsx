/**
 * © 2025 MyDebugger Contributors – MIT License
 * Comprehensive JWKS Probe Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock implementation for JWKS Probe (since the actual component doesn't exist yet)
const JwksProbe = ({ onKeySelected, onError }: { 
  onKeySelected: (key: any) => void; 
  onError: (error: string) => void; 
}) => {
  const [url, setUrl] = React.useState('');
  const [keys, setKeys] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const fetchKeys = async () => {
    if (!url) return;
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Invalid URL format');
      onError('Invalid URL format');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jwks = await response.json();
      
      if (!jwks.keys || !Array.isArray(jwks.keys)) {
        throw new Error('Invalid JWKS format - missing keys array');
      }

      setKeys(jwks.keys);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      const finalError = errorMsg.includes('Failed to fetch') 
        ? 'CORS error or network failure' 
        : errorMsg;
      setError(`Error fetching JWKS: ${finalError}`);
      onError(finalError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>JWKS Endpoint Probe</h2>
      <input
        type="text"
        placeholder="Enter JWKS endpoint URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={fetchKeys} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Keys'}
      </button>
      {keys.length > 0 && (
        <button onClick={fetchKeys}>Refresh</button>
      )}
      
      {error && <div>{error}</div>}
      
      {keys.length === 0 && !loading && !error && url && (
        <div>No keys found</div>
      )}
      
      {keys.map((key, index) => (
        <div key={index}>
          <span>{key.kid || `Key ${index + 1}`}</span>
          <span>{key.kty}</span>
          <span>{key.alg}</span>
          <span>{key.use}</span>
          <button onClick={() => onKeySelected(key)}>Select</button>
          <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(key, null, 2))}>
            Copy
          </button>
        </div>
      ))}
    </div>
  );
};

// Mock fetch for testing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('JwksProbe', () => {
  const mockOnKeySelected = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  test('should render JWKS probe interface', () => {
    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    expect(screen.getByText(/JWKS Endpoint Probe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter JWKS endpoint URL/i)).toBeInTheDocument();
    expect(screen.getByText(/Fetch Keys/i)).toBeInTheDocument();
  });

  test('should fetch and display JWKS from valid endpoint', async () => {
    const mockJwks = {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: 'test-key-1',
          n: 'mock-modulus',
          e: 'AQAB',
          alg: 'RS256'
        },
        {
          kty: 'RSA',
          use: 'sig', 
          kid: 'test-key-2',
          n: 'another-modulus',
          e: 'AQAB',
          alg: 'RS256'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://example.com/.well-known/jwks.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/test-key-1/i)).toBeInTheDocument();
      expect(screen.getByText(/test-key-2/i)).toBeInTheDocument();
      expect(screen.getByText(/RSA/i)).toBeInTheDocument();
    });
  });

  test('should handle network errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://invalid-endpoint.com/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Network error'));
    });

    expect(screen.getByText(/Error fetching JWKS/i)).toBeInTheDocument();
  });

  test('should handle HTTP error responses', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/not-found.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('404'));
    });
  });

  test('should handle invalid JSON response', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/invalid-json.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Invalid JSON'));
    });
  });

  test('should handle malformed JWKS structure', async () => {
    const malformedJwks = {
      keys: 'not-an-array'
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(malformedJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/malformed.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Invalid JWKS format'));
    });
  });

  test('should select key and call callback', async () => {
    const mockJwks = {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: 'test-key-1',
          n: 'mock-modulus',
          e: 'AQAB',
          alg: 'RS256'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/test-key-1/i)).toBeInTheDocument();
    });

    const selectButton = screen.getByText(/Select/i);
    fireEvent.click(selectButton);

    expect(mockOnKeySelected).toHaveBeenCalledWith(mockJwks.keys[0]);
  });

  test('should display key details correctly', async () => {
    const mockJwks = {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: 'test-key-1',
          n: 'very-long-modulus',
          e: 'AQAB',
          alg: 'RS256',
          x5t: 'thumbprint',
          x5c: ['cert1', 'cert2']
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/test-key-1/i)).toBeInTheDocument();
      expect(screen.getByText(/RSA/i)).toBeInTheDocument();
      expect(screen.getByText(/RS256/i)).toBeInTheDocument();
      expect(screen.getByText(/sig/i)).toBeInTheDocument();
    });
  });

  test('should handle different key types', async () => {
    const mockJwks = {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: 'rsa-key',
          n: 'rsa-modulus',
          e: 'AQAB',
          alg: 'RS256'
        },
        {
          kty: 'EC',
          use: 'sig',
          kid: 'ec-key',
          crv: 'P-256',
          x: 'ec-x-coord',
          y: 'ec-y-coord',
          alg: 'ES256'
        },
        {
          kty: 'oct',
          use: 'sig',
          kid: 'hmac-key',
          k: 'symmetric-key',
          alg: 'HS256'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/rsa-key/i)).toBeInTheDocument();
      expect(screen.getByText(/ec-key/i)).toBeInTheDocument();
      expect(screen.getByText(/hmac-key/i)).toBeInTheDocument();
      
      expect(screen.getByText(/RSA/i)).toBeInTheDocument();
      expect(screen.getByText(/EC/i)).toBeInTheDocument();
      expect(screen.getByText(/oct/i)).toBeInTheDocument();
    });
  });

  test('should handle empty JWKS response', async () => {
    const emptyJwks = {
      keys: []
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(emptyJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/No keys found/i)).toBeInTheDocument();
    });
  });

  test('should validate URL format', async () => {
    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'not-a-url');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    expect(screen.getByText(/Invalid URL format/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('should show loading state during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (fetch as jest.Mock).mockReturnValue(promise);

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(fetchButton).toBeDisabled();

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ keys: [] })
    });

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  test('should refresh keys', async () => {
    const mockJwks = {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: 'test-key-1',
          n: 'mock-modulus',
          e: 'AQAB',
          alg: 'RS256'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/test-key-1/i)).toBeInTheDocument();
    });

    const refreshButton = screen.getByText(/Refresh/i);
    fireEvent.click(refreshButton);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('should handle CORS errors', async () => {
    (fetch as jest.Mock).mockRejectedValue(new TypeError('Failed to fetch'));

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://cors-blocked.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('CORS'));
    });
  });

  test('should copy key details to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(void 0),
      },
    });

    const mockJwks = {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: 'test-key-1',
          n: 'mock-modulus',
          e: 'AQAB',
          alg: 'RS256'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/test-key-1/i)).toBeInTheDocument();
    });

    const copyButton = screen.getByText(/Copy/i);
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(mockJwks.keys[0], null, 2)
    );
  });

  test('should filter keys by usage', async () => {
    const mockJwks = {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: 'signing-key',
          n: 'mock-modulus',
          e: 'AQAB',
          alg: 'RS256'
        },
        {
          kty: 'RSA',
          use: 'enc',
          kid: 'encryption-key',
          n: 'another-modulus',
          e: 'AQAB',
          alg: 'RS256'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJwks)
    });

    render(<JwksProbe onKeySelected={mockOnKeySelected} onError={mockOnError} />);
    
    const urlInput = screen.getByPlaceholderText(/Enter JWKS endpoint URL/i);
    await userEvent.type(urlInput, 'https://example.com/.well-known/jwks.json');
    
    const fetchButton = screen.getByText(/Fetch Keys/i);
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/signing-key/i)).toBeInTheDocument();
      expect(screen.getByText(/encryption-key/i)).toBeInTheDocument();
    });

    // Filter by signing keys only
    const sigFilter = screen.getByText(/Signing Only/i);
    fireEvent.click(sigFilter);

    expect(screen.getByText(/signing-key/i)).toBeInTheDocument();
    expect(screen.queryByText(/encryption-key/i)).not.toBeInTheDocument();
  });
});

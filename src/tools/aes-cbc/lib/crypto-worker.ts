/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Crypto Lab - Web Worker for Heavy Operations
 * Offloads PBKDF2 key derivation to prevent UI blocking
 */

// ============================================
// Worker Message Types
// ============================================

export interface PBKDF2WorkerRequest {
  type: 'pbkdf2';
  id: string;
  passphrase: string;
  salt: number[]; // Uint8Array as number array for serialization
  iterations: number;
  keyLength: number;
}

export interface PBKDF2WorkerResponse {
  type: 'pbkdf2';
  id: string;
  success: boolean;
  derivedKey?: number[]; // Uint8Array as number array
  error?: string;
}

export type WorkerRequest = PBKDF2WorkerRequest;
export type WorkerResponse = PBKDF2WorkerResponse;

// ============================================
// Inline Worker Code
// ============================================

const workerCode = `
self.onmessage = async (e) => {
  const request = e.data;

  if (request.type === 'pbkdf2') {
    try {
      const { id, passphrase, salt, iterations, keyLength } = request;

      // Convert salt array back to Uint8Array
      const saltBytes = new Uint8Array(salt);

      // Import passphrase as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(passphrase),
        'PBKDF2',
        false,
        ['deriveBits']
      );

      // Derive bits using PBKDF2
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBytes,
          iterations: iterations,
          hash: 'SHA-256',
        },
        keyMaterial,
        keyLength
      );

      // Convert to array for serialization
      const derivedKey = Array.from(new Uint8Array(derivedBits));

      self.postMessage({
        type: 'pbkdf2',
        id,
        success: true,
        derivedKey,
      });
    } catch (error) {
      self.postMessage({
        type: 'pbkdf2',
        id: request.id,
        success: false,
        error: error.message || 'PBKDF2 derivation failed',
      });
    }
  }
};
`;

// ============================================
// Worker Management
// ============================================

let worker: Worker | null = null;
const pendingRequests: Map<string, {
  resolve: (value: Uint8Array) => void;
  reject: (error: Error) => void;
}> = new Map();

/**
 * Check if Web Workers are supported
 */
export const supportsWebWorkers = (): boolean => {
  return typeof Worker !== 'undefined';
};

/**
 * Create or get the crypto worker instance
 */
const getWorker = (): Worker => {
  if (worker) return worker;

  // Create worker from inline code using Blob
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  worker = new Worker(url);

  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const response = e.data;

    if (response.type === 'pbkdf2') {
      const pending = pendingRequests.get(response.id);
      if (pending) {
        pendingRequests.delete(response.id);
        if (response.success && response.derivedKey) {
          pending.resolve(new Uint8Array(response.derivedKey));
        } else {
          pending.reject(new Error(response.error || 'Unknown worker error'));
        }
      }
    }
  };

  worker.onerror = (error) => {
    console.error('Crypto worker error:', error);
    // Reject all pending requests
    for (const [id, pending] of pendingRequests) {
      pending.reject(new Error('Worker error'));
      pendingRequests.delete(id);
    }
  };

  return worker;
};

/**
 * Terminate the worker and clean up
 */
export const terminateWorker = (): void => {
  if (worker) {
    worker.terminate();
    worker = null;
    pendingRequests.clear();
  }
};

/**
 * Generate a unique request ID
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// PBKDF2 via Web Worker
// ============================================

/**
 * Derive key using PBKDF2 in a Web Worker
 * Falls back to main thread if Workers not supported
 */
export const deriveKeyInWorker = async (
  passphrase: string,
  salt: Uint8Array,
  iterations: number = 100000,
  keyLengthBits: number = 256
): Promise<Uint8Array> => {
  // Fall back to main thread if workers not supported
  if (!supportsWebWorkers()) {
    return deriveKeyMainThread(passphrase, salt, iterations, keyLengthBits);
  }

  const worker = getWorker();
  const id = generateRequestId();

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });

    const request: PBKDF2WorkerRequest = {
      type: 'pbkdf2',
      id,
      passphrase,
      salt: Array.from(salt), // Convert to array for serialization
      iterations,
      keyLength: keyLengthBits,
    };

    worker.postMessage(request);

    // Timeout after 60 seconds
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('PBKDF2 derivation timed out'));
      }
    }, 60000);
  });
};

/**
 * Fallback: derive key on main thread
 */
const deriveKeyMainThread = async (
  passphrase: string,
  salt: Uint8Array,
  iterations: number,
  keyLengthBits: number
): Promise<Uint8Array> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    keyLengthBits
  );

  return new Uint8Array(derivedBits);
};

// ============================================
// Performance Utilities
// ============================================

/**
 * Estimate PBKDF2 derivation time for given iterations
 * Useful for UI feedback
 */
export const estimateDerivationTime = async (
  iterations: number
): Promise<number> => {
  const testPassphrase = 'benchmark';
  const testSalt = new Uint8Array(16);
  crypto.getRandomValues(testSalt);

  // Run a small benchmark with 1000 iterations
  const benchmarkIterations = 1000;
  const start = performance.now();

  await deriveKeyMainThread(testPassphrase, testSalt, benchmarkIterations, 256);

  const elapsed = performance.now() - start;
  const msPerIteration = elapsed / benchmarkIterations;

  return msPerIteration * iterations;
};

/**
 * Recommend whether to use Web Worker based on iterations
 * Generally, use worker for > 10000 iterations
 */
export const shouldUseWorker = (iterations: number): boolean => {
  return iterations >= 10000;
};

// ============================================
// Iteration Recommendations
// ============================================

export const ITERATION_PRESETS = {
  fast: {
    value: 10000,
    label: 'Fast (10,000)',
    description: 'Quick derivation, lower security margin',
    estimatedMs: 50,
  },
  standard: {
    value: 100000,
    label: 'Standard (100,000)',
    description: 'Recommended balance of security and speed',
    estimatedMs: 500,
  },
  high: {
    value: 310000,
    label: 'High Security (310,000)',
    description: 'OWASP 2023 recommendation for SHA-256',
    estimatedMs: 1500,
  },
  paranoid: {
    value: 1000000,
    label: 'Paranoid (1,000,000)',
    description: 'Maximum security, slower derivation',
    estimatedMs: 5000,
  },
} as const;

export type IterationPreset = keyof typeof ITERATION_PRESETS;

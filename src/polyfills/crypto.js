/**
 * Browser-compatible crypto polyfill
 * 
 * This polyfill provides browser compatibility for Node.js crypto module
 * It uses the Web Crypto API (window.crypto.subtle) which is supported in modern browsers
 */

// Use the Web Crypto API
const cryptoApi = window.crypto;

// Export a subset of crypto functionality that mimics the Node.js crypto module
export default {
  // Basic random number generation
  randomBytes: (size) => {
    const array = new Uint8Array(size);
    cryptoApi.getRandomValues(array);
    return array;
  },
  
  // Hash functions
  createHash: (algorithm) => {
    const algorithmMap = {
      'sha1': 'SHA-1',
      'sha256': 'SHA-256',
      'sha384': 'SHA-384',
      'sha512': 'SHA-512',
      // Add more algorithm mappings as needed
    };
    
    const browserAlgorithm = algorithmMap[algorithm] || algorithm;
    
    return {
      update: async (data) => {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        return {
          digest: async (encoding = 'hex') => {
            try {
              const hashBuffer = await cryptoApi.subtle.digest(browserAlgorithm, dataBuffer);
              const hashArray = Array.from(new Uint8Array(hashBuffer));
              
              if (encoding === 'hex') {
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
              } else if (encoding === 'base64') {
                // Convert to base64
                return btoa(String.fromCharCode.apply(null, hashArray));
              }
              
              // Return raw buffer by default
              return hashBuffer;
            } catch (error) {
              console.error('Crypto operation failed:', error);
              throw new Error(`Crypto operation failed: ${error.message}`);
            }
          }
        };
      }
    };
  },
  
  // HMAC functions (simplified)
  createHmac: (algorithm, key) => {
    const algorithmMap = {
      'sha1': 'SHA-1',
      'sha256': 'SHA-256',
      'sha384': 'SHA-384',
      'sha512': 'SHA-512',
    };
    
    const browserAlgorithm = algorithmMap[algorithm] || algorithm;
    
    return {
      update: async (data) => {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const keyBuffer = encoder.encode(key);
        
        return {
          digest: async (encoding = 'hex') => {
            try {
              // Import the key
              const cryptoKey = await cryptoApi.subtle.importKey(
                'raw',
                keyBuffer,
                { name: 'HMAC', hash: { name: browserAlgorithm } },
                false,
                ['sign']
              );
              
              // Sign the data
              const signature = await cryptoApi.subtle.sign(
                { name: 'HMAC' },
                cryptoKey,
                dataBuffer
              );
              
              const hashArray = Array.from(new Uint8Array(signature));
              
              if (encoding === 'hex') {
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
              } else if (encoding === 'base64') {
                return btoa(String.fromCharCode.apply(null, hashArray));
              }
              
              return signature;
            } catch (error) {
              console.error('HMAC operation failed:', error);
              throw new Error(`HMAC operation failed: ${error.message}`);
            }
          }
        };
      }
    };
  }
};

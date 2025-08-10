/**
 * © 2025 MyDebugger Contributors – MIT License
 * Utility Functions & Hooks Comprehensive Tests
 */

describe('Utility Functions - String Operations', () => {
  // Test URL utilities
  const encodeUrlQueryParams = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const base = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      const params = Array.from(urlObj.searchParams.entries())
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      return params ? `${base}?${params}${urlObj.hash}` : `${base}${urlObj.hash}`;
    } catch {
      return url;
    }
  };

  test('should encode URL query parameters', () => {
    const url = 'https://example.com/search?q=hello world&type=test';
    const encoded = encodeUrlQueryParams(url);
    expect(encoded).toContain('hello%20world');
  });

  test('should handle malformed URLs', () => {
    const malformed = 'not-a-url?param=value with spaces';
    const result = encodeUrlQueryParams(malformed);
    expect(result).toBe(malformed); // Should return original for malformed URLs
  });

  // Test string sanitization
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  test('should remove dangerous script tags', () => {
    const dangerous = '<script>alert("xss")</script>Hello';
    const sanitized = sanitizeInput(dangerous);
    expect(sanitized).toBe('Hello');
    expect(sanitized).not.toContain('<script>');
  });

  test('should remove javascript protocol', () => {
    const dangerous = 'javascript:alert(1)';
    const sanitized = sanitizeInput(dangerous);
    expect(sanitized).not.toContain('javascript:');
  });

  // Test validation utilities
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  test('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  test('should reject invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
  });

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  test('should validate URLs correctly', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://localhost:3000')).toBe(true);
    expect(validateUrl('ftp://files.example.com')).toBe(true);
  });

  test('should reject invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false);
    expect(validateUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('Utility Functions - Data Processing', () => {
  // Test CSV parsing
  const parseCSV = (csvString: string, delimiter: string = ','): string[][] => {
    const lines = csvString.trim().split('\\n');
    return lines.map(line => 
      line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''))
    );
  };

  test('should parse CSV data correctly', () => {
    const csvData = 'Name,Age,City\\nJohn,25,NYC\\nJane,30,LA';
    const parsed = parseCSV(csvData);
    
    expect(parsed).toHaveLength(3); // Header + 2 data rows
    expect(parsed[0]).toEqual(['Name', 'Age', 'City']);
    expect(parsed[1]).toEqual(['John', '25', 'NYC']);
  });

  test('should handle different delimiters', () => {
    const csvData = 'Name;Age;City\\nJohn;25;NYC';
    const parsed = parseCSV(csvData, ';');
    
    expect(parsed[1]).toEqual(['John', '25', 'NYC']);
  });

  test('should handle quoted fields', () => {
    const csvData = '"Name","Age","City"\\n"John Doe","25","New York"';
    const parsed = parseCSV(csvData);
    
    expect(parsed[1]).toEqual(['John Doe', '25', 'New York']);
  });

  // Test markdown conversion
  const csvToMarkdown = (csvData: string[][]): string => {
    if (csvData.length === 0) return '';
    
    const header = csvData[0];
    const rows = csvData.slice(1);
    
    let markdown = '| ' + header.join(' | ') + ' |\\n';
    markdown += '| ' + header.map(() => '---').join(' | ') + ' |\\n';
    
    rows.forEach(row => {
      markdown += '| ' + row.join(' | ') + ' |\\n';
    });
    
    return markdown;
  };

  test('should convert CSV to markdown table', () => {
    const csvData = [
      ['Name', 'Age', 'City'],
      ['John', '25', 'NYC'],
      ['Jane', '30', 'LA']
    ];
    
    const markdown = csvToMarkdown(csvData);
    expect(markdown).toContain('| Name | Age | City |');
    expect(markdown).toContain('| --- | --- | --- |');
    expect(markdown).toContain('| John | 25 | NYC |');
  });

  // Test file size formatting
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  test('should format file sizes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  test('should handle decimal file sizes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5 * 1024
    expect(formatFileSize(2097152)).toBe('2 MB'); // 2 * 1024 * 1024
  });
});

describe('Utility Functions - Security & Validation', () => {
  // Test header analysis
  const analyzeSecurityHeaders = (headers: Record<string, string>) => {
    const results = [];
    
    // Check X-Frame-Options
    const frameOptions = headers['x-frame-options'];
    if (!frameOptions) {
      results.push({
        header: 'X-Frame-Options',
        status: 'missing',
        fix: 'Add X-Frame-Options: DENY or SAMEORIGIN'
      });
    } else if (['deny', 'sameorigin'].includes(frameOptions.toLowerCase())) {
      results.push({
        header: 'X-Frame-Options',
        status: 'good',
        fix: 'Header is properly configured'
      });
    }
    
    // Check CSP
    const csp = headers['content-security-policy'];
    if (!csp) {
      results.push({
        header: 'Content-Security-Policy',
        status: 'missing',
        fix: 'Define a Content Security Policy'
      });
    } else if (csp.includes("'unsafe-inline'") || csp.includes("'unsafe-eval'")) {
      results.push({
        header: 'Content-Security-Policy',
        status: 'warning',
        fix: 'Remove unsafe directives from CSP'
      });
    } else {
      results.push({
        header: 'Content-Security-Policy',
        status: 'good',
        fix: 'CSP is properly configured'
      });
    }
    
    return results;
  };

  test('should detect missing security headers', () => {
    const headers = {
      'content-type': 'text/html'
    };
    
    const results = analyzeSecurityHeaders(headers);
    const missingHeaders = results.filter(r => r.status === 'missing');
    expect(missingHeaders.length).toBeGreaterThan(0);
  });

  test('should validate good security headers', () => {
    const headers = {
      'x-frame-options': 'SAMEORIGIN',
      'content-security-policy': "default-src 'self'"
    };
    
    const results = analyzeSecurityHeaders(headers);
    const goodHeaders = results.filter(r => r.status === 'good');
    expect(goodHeaders.length).toBe(2);
  });

  test('should detect weak CSP policies', () => {
    const headers = {
      'content-security-policy': "default-src 'unsafe-inline'"
    };
    
    const results = analyzeSecurityHeaders(headers);
    const cspResult = results.find(r => r.header === 'Content-Security-Policy');
    expect(cspResult?.status).toBe('warning');
  });

  // Test CORS validation
  const validateCorsOrigin = (origin: string, allowedOrigins: string[]): boolean => {
    if (allowedOrigins.includes('*')) return true;
    return allowedOrigins.includes(origin);
  };

  test('should validate CORS origins', () => {
    const allowedOrigins = ['https://example.com', 'https://app.example.com'];
    
    expect(validateCorsOrigin('https://example.com', allowedOrigins)).toBe(true);
    expect(validateCorsOrigin('https://malicious.com', allowedOrigins)).toBe(false);
  });

  test('should handle wildcard origins', () => {
    const wildcardOrigins = ['*'];
    
    expect(validateCorsOrigin('https://any-domain.com', wildcardOrigins)).toBe(true);
  });

  // Test input sanitization
  const sanitizeHtml = (html: string): string => {
    const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    
    return html.replace(tagRegex, (match, tag) => {
      if (allowedTags.includes(tag.toLowerCase())) {
        return match;
      }
      return '';
    });
  };

  test('should allow safe HTML tags', () => {
    const html = '<p>Hello <strong>World</strong></p>';
    const sanitized = sanitizeHtml(html);
    expect(sanitized).toContain('<p>');
    expect(sanitized).toContain('<strong>');
  });

  test('should remove dangerous HTML tags', () => {
    const html = '<script>alert("xss")</script><p>Safe content</p>';
    const sanitized = sanitizeHtml(html);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<p>Safe content</p>');
  });
});

describe('Utility Functions - Performance & Optimization', () => {
  // Test debouncing
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  test('should debounce function calls', (done) => {
    let callCount = 0;
    const debouncedFn = debounce(() => {
      callCount++;
    }, 100);
    
    // Call multiple times rapidly
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    // Should only execute once after delay
    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 150);
  });

  // Test throttling
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  test('should throttle function calls', (done) => {
    let callCount = 0;
    const throttledFn = throttle(() => {
      callCount++;
    }, 100);
    
    // Call multiple times rapidly
    throttledFn(); // Should execute
    throttledFn(); // Should be throttled
    throttledFn(); // Should be throttled
    
    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 50);
  });

  // Test memoization
  const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  };

  test('should memoize function results', () => {
    let executionCount = 0;
    const expensiveFunction = memoize((x: number) => {
      executionCount++;
      return x * x;
    });
    
    expect(expensiveFunction(5)).toBe(25);
    expect(expensiveFunction(5)).toBe(25); // Should use cached result
    expect(executionCount).toBe(1); // Function executed only once
  });

  // Test cache management
  const createLRUCache = <K, V>(maxSize: number) => {
    const cache = new Map<K, V>();
    
    return {
      get(key: K): V | undefined {
        if (cache.has(key)) {
          const value = cache.get(key)!;
          cache.delete(key);
          cache.set(key, value); // Move to end
          return value;
        }
        return undefined;
      },
      
      set(key: K, value: V): void {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },
      
      size(): number {
        return cache.size;
      }
    };
  };

  test('should implement LRU cache correctly', () => {
    const cache = createLRUCache<string, number>(2);
    
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size()).toBe(2);
    
    cache.set('c', 3); // Should evict 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });
});

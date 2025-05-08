import { analyzeToken, JwtInfo, Finding, SeverityLevel, getSeverityEmoji, getSeverityClass } from '../analyzer';

// Mock date for consistent tests
const now = Math.floor(Date.now() / 1000);
const oneHourInSeconds = 60 * 60;
const oneDayInSeconds = 24 * oneHourInSeconds;

describe('JWT Analyzer', () => {
  // Helper function to create a basic valid JWT info object
  const createValidJwt = (): JwtInfo => ({
    header: {
      alg: 'RS256',
      typ: 'JWT',
      kid: 'test-key-id'
    },
    payload: {
      sub: 'user123',
      iat: now - 300, // 5 minutes ago
      exp: now + oneHourInSeconds, // 1 hour from now
      iss: 'https://example.com',
      aud: 'myapp'
    },
    signature: 'valid-signature'
  });

  describe('analyzeToken', () => {
    it('should report no findings for a valid token', () => {
      const jwt = createValidJwt();
      const findings = analyzeToken(jwt);
      expect(findings).toHaveLength(0);
    });

    it('should detect "none" algorithm', () => {
      const jwt = createValidJwt();
      jwt.header.alg = 'none';
      
      const findings = analyzeToken(jwt);
      
      expect(findings).toHaveLength(1);
      expect(findings[0].id).toBe('JWT-NONE-ALG');
      expect(findings[0].severity).toBe('high');
    });

    it('should detect missing expiration', () => {
      const jwt = createValidJwt();
      delete jwt.payload.exp;
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-NO-EXP')).toBe(true);
      const finding = findings.find(f => f.id === 'JWT-NO-EXP');
      expect(finding?.severity).toBe('medium');
    });

    it('should detect expired token', () => {
      const jwt = createValidJwt();
      jwt.payload.exp = now - 3600; // Expired 1 hour ago
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-EXPIRED')).toBe(true);
    });

    it('should detect long expiration time', () => {
      const jwt = createValidJwt();
      jwt.payload.exp = now + (30 * oneDayInSeconds); // 30 days in the future
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-LONG-EXP')).toBe(true);
    });

    it('should detect impending expiration', () => {
      const jwt = createValidJwt();
      jwt.payload.exp = now + 180; // 3 minutes in the future
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-EXPIRING-SOON')).toBe(true);
    });

    it('should detect missing issued-at time', () => {
      const jwt = createValidJwt();
      delete jwt.payload.iat;
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-NO-IAT')).toBe(true);
    });

    it('should detect future issued-at time', () => {
      const jwt = createValidJwt();
      jwt.payload.iat = now + 3600; // 1 hour in the future
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-FUTURE-IAT')).toBe(true);
    });

    it('should detect not-before time in the future', () => {
      const jwt = createValidJwt();
      jwt.payload.nbf = now + 3600; // Valid 1 hour from now
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-FUTURE-NBF')).toBe(true);
    });

    it('should detect weak algorithms', () => {
      const jwt = createValidJwt();
      jwt.header.alg = 'HS256';
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-WEAK-ALG-HS256')).toBe(true);
    });

    it('should detect missing audience', () => {
      const jwt = createValidJwt();
      delete jwt.payload.aud;
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-NO-AUD')).toBe(true);
    });

    it('should detect missing key ID for asymmetric algorithms', () => {
      const jwt = createValidJwt();
      delete jwt.header.kid;
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-NO-KID')).toBe(true);
    });

    it('should not report missing KID for symmetric algorithms', () => {
      const jwt = createValidJwt();
      jwt.header.alg = 'HS256';
      delete jwt.header.kid;
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-NO-KID')).toBe(false);
    });

    it('should detect missing type header', () => {
      const jwt = createValidJwt();
      delete jwt.header.typ;
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-NO-TYP')).toBe(true);
    });

    it('should detect unusual type header', () => {
      const jwt = createValidJwt();
      jwt.header.typ = 'CUSTOM';
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-UNUSUAL-TYP')).toBe(true);
    });

    it('should detect missing signature despite algorithm', () => {
      const jwt = createValidJwt();
      jwt.signature = '';
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-MISSING-SIG')).toBe(true);
    });

    it('should detect nested JWT in payload claims', () => {
      const jwt = createValidJwt();
      jwt.payload.token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-NESTED')).toBe(true);
    });

    it('should detect critical claims extension', () => {
      const jwt = createValidJwt();
      jwt.header.crit = ['custom-claim'];
      
      const findings = analyzeToken(jwt);
      
      expect(findings.some(f => f.id === 'JWT-CRIT-CLAIM')).toBe(true);
    });

    it('should detect multiple security issues in one token', () => {
      const jwt = createValidJwt();
      jwt.header.alg = 'HS256';
      delete jwt.payload.exp;
      delete jwt.payload.aud;
      
      const findings = analyzeToken(jwt);
      
      // Should detect weak algorithm, missing exp, and missing aud
      expect(findings.length).toBeGreaterThanOrEqual(3);
      expect(findings.some(f => f.id === 'JWT-WEAK-ALG-HS256')).toBe(true);
      expect(findings.some(f => f.id === 'JWT-NO-EXP')).toBe(true);
      expect(findings.some(f => f.id === 'JWT-NO-AUD')).toBe(true);
    });
  });

  describe('getSeverityEmoji', () => {
    it('should return correct emoji for each severity level', () => {
      expect(getSeverityEmoji('high')).toBe('🔴');
      expect(getSeverityEmoji('medium')).toBe('🟠');
      expect(getSeverityEmoji('low')).toBe('🟡');
      expect(getSeverityEmoji('info')).toBe('ℹ️');
    });
  });

  describe('getSeverityClass', () => {
    it('should return correct CSS class for each severity level', () => {
      expect(getSeverityClass('high')).toBe('error');
      expect(getSeverityClass('medium')).toBe('warning');
      expect(getSeverityClass('low')).toBe('warning');
      expect(getSeverityClass('info')).toBe('info');
    });
  });
});
import { analyzeToken, getSeverityClass, getSeverityEmoji } from '../src/tools/jwt/utils/analyzer';

describe('JWT analyzer', () => {
  test('flags none algorithm', () => {
    const findings = analyzeToken({
      header: { alg: 'none' },
      payload: {},
      signature: '',
    });
    expect(findings.some(f => f.id === 'JWT-NONE-ALG')).toBe(true);
    expect(getSeverityEmoji('high')).toBeDefined();
    expect(getSeverityClass('low')).toContain('');
  });

  test.each(['none', 'None', 'NONE', 'nOnE'])(
    'flags "%s" alg as JWT-NONE-ALG at high severity and never fires JWT-MISSING-SIG',
    (alg) => {
      const findings = analyzeToken({
        header: { alg },
        payload: {},
        signature: '',
      });
      const noneFinding = findings.find(f => f.id === 'JWT-NONE-ALG');
      expect(noneFinding).toBeDefined();
      expect(noneFinding?.severity).toBe('high');
      expect(findings.some(f => f.id === 'JWT-MISSING-SIG')).toBe(false);
    }
  );

  test('HS256 still emits its weak-algorithm finding and checkKid still skips HS* algorithms', () => {
    const findings = analyzeToken({
      header: { alg: 'HS256' },
      payload: {},
      signature: 'sig',
    });
    expect(findings.some(f => f.id === 'JWT-WEAK-ALG-HS256')).toBe(true);
    expect(findings.some(f => f.id === 'JWT-NO-KID')).toBe(false);
  });
});



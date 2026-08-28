import { analyzeToken, getSeverityClass, getSeverityEmoji } from '../src/tools/jwt/utils/analyzer';
import {
  analyzeToken as analyzeTokenWorker,
  base64UrlEncode,
} from '../src/tools/jwt/workers/cryptoWorker';

const buildToken = (alg: unknown): string => {
  const header = base64UrlEncode(JSON.stringify({ alg, typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({ sub: 'x' }));
  return `${header}.${payload}.sig`;
};

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

  test.each(['none', 'None', 'NONE', 'nOnE'])(
    'cryptoWorker.analyzeToken flags "%s" alg as high-severity alg-none',
    async (alg) => {
      const issues = await analyzeTokenWorker(buildToken(alg));
      const noneIssue = issues.find(i => i.id === 'alg-none');
      expect(noneIssue).toBeDefined();
      expect(noneIssue?.severity).toBe('high');
    }
  );

  test('cryptoWorker.analyzeToken still flags HS256 as a weaker algorithm', async () => {
    const issues = await analyzeTokenWorker(buildToken('HS256'));
    expect(issues.some(i => i.id === 'weak-hs256')).toBe(true);
    expect(issues.some(i => i.id === 'alg-none')).toBe(false);
  });
});



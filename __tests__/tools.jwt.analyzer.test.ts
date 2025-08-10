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
});



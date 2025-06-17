import { generateVCard, encodeContactData, decodeContactData } from '../model/virtualCard';

describe('generateVCard', () => {
  it('creates a minimal vcard', () => {
    const v = generateVCard({ fullName: 'Jane Doe' });
    expect(v).toContain('BEGIN:VCARD');
    expect(v).toContain('FN:Jane Doe');
    expect(v).toContain('END:VCARD');
  });

  it('includes optional fields', () => {
    const v = generateVCard({ fullName: 'J', phone: '+1', email: 'a@b.c', organization: 'Org', title: 'CEO', website: 'https://a', address: '123' });
    expect(v).toContain('TEL;TYPE=CELL:+1');
    expect(v).toContain('EMAIL:a@b.c');
    expect(v).toContain('ORG:Org');
    expect(v).toContain('TITLE:CEO');
    expect(v).toContain('URL:https://a');
    expect(v).toContain('ADR:123');
  });

  it('throws without fullName', () => {
    // @ts-expect-error testing runtime error
    expect(() => generateVCard({})).toThrow('fullName is required');
  });
});

describe('encodeContactData/decodeContactData', () => {
  it('round trips contact info', () => {
    const info = { fullName: 'John Doe', phone: '+123', email: 'a@b.com', organization: 'Org', title: 'Dev', website: 'https://a', address: '123' };
    const enc = encodeContactData(info);
    const dec = decodeContactData(enc);
    expect(dec).toEqual(info);
  });

  it('returns null on invalid input', () => {
    expect(decodeContactData('!nv4l!d')).toBeNull();
  });
});

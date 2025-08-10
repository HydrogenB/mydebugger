import { generateICalEvent } from '../src/tools/qrcode/lib/ical';
import { blobToDataURL } from '../src/tools/qrcode/lib/qrcode';

describe('QR ancillary libs', () => {
  test('generateICalEvent requires start/end and escapes fields', () => {
    expect(() => generateICalEvent({ start: '', end: '' } as any)).toThrow();
    const ics = generateICalEvent({ start: '2025-01-01T10:00', end: '2025-01-01T11:00', summary: 'Line1\nLine2' });
    expect(ics).toContain('SUMMARY:Line1\\nLine2');
    expect(ics).toContain('DTSTART:');
    expect(ics).toContain('DTEND:');
  });

  test('blobToDataURL converts blob', async () => {
    const b = new Blob(['hello'], { type: 'text/plain' });
    const url = await blobToDataURL(b);
    expect(url.startsWith('data:')).toBe(true);
  });
});



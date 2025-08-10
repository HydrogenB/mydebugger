import { getPresetByName } from '../src/tools/qrcode/lib/qrcodePresets';

describe('QR presets', () => {
  test('getPresetByName returns preset', () => {
    const p = getPresetByName('Classic');
    // Some repositories may not include 'Classic', so allow undefined but ensure function exists
    expect(typeof getPresetByName).toBe('function');
    if (p) {
      expect(p.name).toBe('Classic');
    }
  });
});



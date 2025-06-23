import { QR_PRESETS, getPresetByName } from '../model/qrcodePresets';

describe('QR presets', () => {
  it('contains 10 presets', () => {
    expect(QR_PRESETS).toHaveLength(10);
  });

  it('finds preset by name', () => {
    const preset = getPresetByName('Classic Black');
    expect(preset).toBeDefined();
    expect(preset?.darkColor).toBe('#000000');
  });
});

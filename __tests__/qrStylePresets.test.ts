import qrStylePresets from '../model/qrStylePresets';

describe('qrStylePresets', () => {
  it('contains 40 presets', () => {
    expect(qrStylePresets).toHaveLength(40);
  });

  it('each preset has a name and group', () => {
    qrStylePresets.forEach((p) => {
      expect(p.name).toBeTruthy();
      expect(p.group).toBeTruthy();
    });
  });
});

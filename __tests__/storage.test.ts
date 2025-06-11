import {
  getStorageSnapshot,
  entriesToEnv,
  diffSnapshots,
  isJsonValid,
} from '../model/storage';

describe('getStorageSnapshot', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('collects items from both storages', () => {
    localStorage.setItem('foo', '1');
    sessionStorage.setItem('bar', '2');
    const snap = getStorageSnapshot();
    expect(snap).toEqual(
      expect.arrayContaining([
        { key: 'foo', value: '1', domain: 'localhost', size: 4, area: 'localStorage' },
        { key: 'bar', value: '2', domain: 'localhost', size: 4, area: 'sessionStorage' },
      ])
    );
  });

  it('exports env format', () => {
    localStorage.setItem('k', 'v');
    const snap = getStorageSnapshot();
    expect(entriesToEnv(snap.filter((e) => e.key === 'k'))).toBe('k="v"');
  });

  it('diffs snapshots', () => {
    localStorage.setItem('a', '1');
    const base = getStorageSnapshot();
    localStorage.setItem('a', '2');
    sessionStorage.setItem('b', '3');
    const other = getStorageSnapshot();
    const diff = diffSnapshots(base, other);
    expect(diff.added.some((e) => e.key === 'b')).toBe(true);
    expect(diff.changed.some((c) => c.key === 'a')).toBe(true);
  });
});

describe('isJsonValid', () => {
  it('validates JSON-like strings', () => {
    expect(isJsonValid('{"a":1}')).toBe(true);
    expect(isJsonValid('{bad')).toBe(false);
    expect(isJsonValid('plain')).toBe(true);
  });
});

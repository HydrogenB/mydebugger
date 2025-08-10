import { entriesToEnv, diffSnapshots, isJsonValid } from '../src/tools/storage-sync/lib/storage';

describe('Storage Sync utils', () => {
  test('entriesToEnv formats correctly', () => {
    const env = entriesToEnv([
      { key: 'A', value: '1', domain: 'x', size: 2, area: 'localStorage' },
      { key: 'B', value: '2', domain: 'x', size: 2, area: 'sessionStorage' },
    ]);
    expect(env.split('\n')[0]).toBe('A="1"');
  });

  test('diffSnapshots computes added/removed/changed', () => {
    const a = [
      { key: 'A', value: '1', domain: 'x', size: 2, area: 'localStorage' },
      { key: 'B', value: '1', domain: 'x', size: 2, area: 'sessionStorage' },
    ];
    const b = [
      { key: 'B', value: '2', domain: 'x', size: 2, area: 'sessionStorage' },
      { key: 'C', value: '3', domain: 'x', size: 2, area: 'localStorage' },
    ];
    const diff = diffSnapshots(a, b);
    expect(diff.added.map(e => e.key)).toEqual(['C']);
    expect(diff.removed.map(e => e.key)).toEqual(['A']);
    expect(diff.changed[0]).toEqual({ key: 'B', before: '1', after: '2' });
  });

  test('isJsonValid accepts non-json strings and valid json', () => {
    expect(isJsonValid('plain')).toBe(true);
    expect(isJsonValid('{"a":1}')).toBe(true);
    expect(isJsonValid('{')).toBe(false);
  });
});



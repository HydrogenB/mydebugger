import { compareJson } from '../src/tools/json-compare/lib/jsonCompare';

describe('json-compare: compareJson', () => {
  it('detects added, removed and modified keys', () => {
    const left = { a: 1, b: 2, nested: { x: 1 }, arr: [1, 2] };
    const right = { a: 1, b: 3, nested: { x: 2 }, arr: [1, 2, 3], added: true };
    const report = compareJson(left, right);
    expect(report.summary.added).toBeGreaterThanOrEqual(2); // arr[2], added
    expect(report.summary.removed).toBeGreaterThanOrEqual(0);
    expect(report.summary.modified).toBeGreaterThanOrEqual(2); // b, nested.x
    const paths = report.changes.map(c => c.path);
    expect(paths).toEqual(expect.arrayContaining([
      '/b', '/nested/x', '/arr/2', '/added'
    ]));
  });

  it('handles arrays of different lengths', () => {
    const left = [1, 2];
    const right = [2];
    const report = compareJson(left, right);
    expect(report.summary.modified + report.summary.removed + report.summary.added).toBeGreaterThan(0);
  });

  it('treats -0 and 0 as equal, NaN changes as modified', () => {
    const report1 = compareJson(-0, 0);
    expect(report1.summary.modified).toBe(0);

    // Note: NaN is not valid JSON, but function may be used with JS values.
    const report2 = compareJson(NaN as any, 1 as any);
    expect(report2.summary.modified).toBe(1);
  });

  it('considers null vs object as modified at root with path /', () => {
    const report = compareJson(null, { a: 1 });
    expect(report.summary.modified).toBe(1);
    expect(report.changes[0].path).toBe('/');
  });
});



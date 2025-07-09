import { parseJson, convertJsonToCsv } from '../model/jsonConverter';

const sample = '[{"a":1,"b":{"c":2}}]';

test('parseJson returns array', () => {
  expect(parseJson(sample)).toEqual([{ a: 1, b: { c: 2 } }]);
});

test('convertJsonToCsv flattens when enabled', () => {
  const csv = convertJsonToCsv(sample, { flatten: true, header: true, eol: '\n' });
  expect(csv.trim()).toBe('a,b.c\n1,2');
});

test('parseJson throws on invalid input', () => {
  expect(() => parseJson('bad')).toThrow('Invalid JSON input');
});

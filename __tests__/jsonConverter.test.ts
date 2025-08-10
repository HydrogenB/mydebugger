import { parseJson, convertJsonToCsv } from '../src/tools/json-converter/lib/jsonConverter';

const sample = '[{"a":1,"b":{"c":2}}]';

test('parseJson returns array', () => {
  expect(parseJson(sample)).toEqual([{ a: 1, b: { c: 2 } }]);
});

test('convertJsonToCsv flattens when enabled', () => {
  const csv = convertJsonToCsv(sample, { flatten: true, includeHeader: true, eol: '\n' });
  expect(csv.trim()).toBe('a,b.c\n1,2');
});

test('convertJsonToCsv respects delimiter and date format', () => {
  const data = '[{"date":"2025-01-01","val":2}]';
  const csv = convertJsonToCsv(data, {
    flatten: true,
    delimiter: ';',
    dateFormat: 'YYYY',
    includeHeader: true,
    eol: '\n',
  });
  expect(csv.trim()).toBe('date;val\n2025;2');
});

test('parseJson throws on invalid input', () => {
  expect(() => parseJson('bad')).toThrow('Invalid JSON input');
});

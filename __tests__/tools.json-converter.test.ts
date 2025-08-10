import { parseJson, convertJsonToCsv } from '../src/tools/json-converter/lib/jsonConverter';

describe('JSON converter', () => {
  test('parseJson returns array', () => {
    const arr = parseJson('[{"a":1},{"b":2}]');
    expect(Array.isArray(arr)).toBe(true);
    expect(arr).toHaveLength(2);
  });

  test('convertJsonToCsv produces header row', () => {
    const csv = convertJsonToCsv('[{"a":1,"b":2}]', { delimiter: ',', includeHeader: true, suppressNewlines: false, flatten: false, pivot: false, dateFormat: 'iso', forceQuotes: false, objectPath: '', upgradeToArray: false, useAltMode: false, eol: 'LF' });
    expect(csv.split('\n')[0]).toContain('a');
  });
});



import { sortByTitle } from '../src/utils/toolFilters';

describe('sortByTitle', () => {
  const items = [
    { title: 'Banana' },
    { title: 'Apple' },
    { title: 'Cherry' },
  ];

  test('sorts ascending by title', () => {
    const sorted = sortByTitle(items, 'asc');
    expect(sorted.map(i => i.title)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  test('sorts descending by title', () => {
    const sorted = sortByTitle(items, 'desc');
    expect(sorted.map(i => i.title)).toEqual(['Cherry', 'Banana', 'Apple']);
  });
});

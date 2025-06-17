import { excludeById } from '../src/utils/toolFilters';

type Item = { id: string; value: string };

describe('excludeById', () => {
  it('removes items present in the exclusion list', () => {
    const all: Item[] = [
      { id: 'a', value: '1' },
      { id: 'b', value: '2' },
      { id: 'c', value: '3' },
    ];
    const exclude: Item[] = [{ id: 'b', value: '2' }];
    const res = excludeById(all, exclude);
    expect(res).toEqual([
      { id: 'a', value: '1' },
      { id: 'c', value: '3' },
    ]);
  });
});

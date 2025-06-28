import { renderHook, act, waitFor } from '@testing-library/react';
import useCsvtomd from '../viewmodel/useCsvtomd';

describe('useCsvtomd hook', () => {
  it('parses CSV and generates markdown', async () => {
    const { result } = renderHook(() => useCsvtomd());
    act(() => {
      result.current.setCsv('name,age\nAlice,30\nBob,40');
    });
    await waitFor(() => result.current.markdown !== '');
    expect(result.current.headers).toEqual(['name', 'age']);
    expect(result.current.markdown).toContain('| Alice | 30 |');
  });

  it('toggles alignment cycling through values', () => {
    const { result } = renderHook(() => useCsvtomd());
    act(() => {
      result.current.setCsv('a,b\n1,2');
    });
    act(() => {
      result.current.toggleAlignment(0);
    });
    expect(result.current.alignment[0]).toBe('center');
    act(() => {
      result.current.toggleAlignment(0);
    });
    expect(result.current.alignment[0]).toBe('right');
  });

  it('copies markdown to clipboard', async () => {
    const { result } = renderHook(() => useCsvtomd());
    act(() => {
      result.current.setCsv('a,b\n1,2');
    });
    await waitFor(() => result.current.markdown !== '');
    (navigator as any).clipboard = { writeText: jest.fn() };
    await act(async () => {
      await result.current.copyMarkdown();
    });
    expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith(result.current.markdown);
  });
});

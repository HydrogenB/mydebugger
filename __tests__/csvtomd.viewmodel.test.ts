import { renderHook, act, waitFor } from '@testing-library/react';
import useCsvtomd from '../src/tools/csvtomd/hooks/useCsvtomd.ts';

// Mock clipboard API
const writeTextMock = jest.fn();
Object.assign(navigator, {
  clipboard: { writeText: writeTextMock },
});

describe('useCsvtomd hook', () => {
  beforeEach(() => {
    writeTextMock.mockReset();
  });

  it('parses CSV input and generates markdown', async () => {
    const { result } = renderHook(() => useCsvtomd());
    act(() => {
      result.current.setCsv('name,age\nAlice,30');
    });
    await waitFor(() => result.current.headers.length > 0);
    expect(result.current.headers).toEqual(['name', 'age']);
    expect(result.current.markdown).toContain('| Alice | 30 |');
  });

  it('cycles alignment when toggled', () => {
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
    await waitFor(() => result.current.markdown.length > 0);
    await act(async () => {
      await result.current.copyMarkdown();
    });
    expect(writeTextMock).toHaveBeenCalledWith(result.current.markdown);
  });
});

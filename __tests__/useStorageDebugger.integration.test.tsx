import { renderHook, act } from '@testing-library/react';
import useStorageDebugger from '../src/tools/storage-sync/hooks/useStorageDebugger.ts';

class FakeBC {
  handlers: ((e: { data: any }) => void)[] = [];
  constructor(public name: string) {}
  postMessage(data: any) { this.handlers.forEach((h) => h({ data })); }
  addEventListener(event: 'message', cb: (e: { data: any }) => void) {
    if (event === 'message') this.handlers.push(cb);
  }
  removeEventListener(event: 'message', cb: (e: { data: any }) => void) {
    if (event === 'message') this.handlers = this.handlers.filter((h) => h !== cb);
  }
  close() {}
}

global.BroadcastChannel = FakeBC as any;

describe('useStorageDebugger', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds and edits entries with debounce', () => {
    const { result } = renderHook(() => useStorageDebugger());
    act(() => {
      result.current.editEntry('foo', '1', 'localStorage');
    });
    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(localStorage.getItem('foo')).toBe('1');

    act(() => {
      result.current.editEntry('foo', '2', 'localStorage');
    });
    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(localStorage.getItem('foo')).toBe('2');
  });

  it('removes entries', () => {
    const { result } = renderHook(() => useStorageDebugger());
    act(() => {
      result.current.editEntry('bar', '1', 'sessionStorage');
      jest.advanceTimersByTime(350);
    });
    act(() => {
      result.current.removeEntry('bar', 'sessionStorage');
    });
    expect(sessionStorage.getItem('bar')).toBeNull();
  });

  it('responds to storage events', () => {
    const { result } = renderHook(() => useStorageDebugger());
    act(() => {
      localStorage.setItem('x', '5');
      window.dispatchEvent(
        new StorageEvent('storage', { storageArea: localStorage, key: 'x' }),
      );
    });
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('filters entries by search query', () => {
    const { result } = renderHook(() => useStorageDebugger());
    act(() => {
      result.current.editEntry('foo', '1', 'localStorage');
      result.current.editEntry('bar', '2', 'localStorage');
    });
    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(result.current.entries.length).toBe(2);
    act(() => {
      result.current.setSearch('foo');
    });
    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(result.current.entries.length).toBe(1);
    expect(result.current.entries[0].key).toBe('foo');
  });
});

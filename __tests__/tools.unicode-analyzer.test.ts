import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { analyzeText } from '../src/tools/unicode-analyzer/lib/analyzer';
import { useUnicodeAnalyzer } from '../src/tools/unicode-analyzer/hooks/useUnicodeAnalyzer';
import { AnalyzerView } from '../src/tools/unicode-analyzer/components/AnalyzerView';

// `@design-system` is a Vite path alias (see vite.config.ts / tsconfig paths).
// jest.config.cjs has no moduleNameMapper entry for it, so any component tree
// that imports from it needs a virtual mock to be testable under Jest at all
// -- unrelated to this task's fix, just what's needed to render AnalyzerView.
jest.mock(
  '@design-system',
  () => {
    // Required lazily inside the factory: jest hoists jest.mock() above
    // imports, so the top-level `React` import isn't in scope here yet.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactLib = require('react');
    return {
      TOOL_PANEL_CLASS: 'tool-panel',
      Button: ({ children, ...props }: Record<string, unknown>) =>
        ReactLib.createElement('button', { type: 'button', ...props }, children),
      LoadingSpinner: () => ReactLib.createElement('div', null, 'Loading...'),
      Tooltip: ({ children }: Record<string, unknown>) => children,
    };
  },
  { virtual: true },
);

// A ZWJ family sequence: man + ZWJ + woman + ZWJ + girl + ZWJ + boy. Seven
// code points, but one user-perceived grapheme when clustering is correct.
const ZWJ_FAMILY = '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}';

function independentCodePointCount(input: string): number {
  return Array.from(input).length;
}

function independentUtf8ByteCount(input: string): number {
  return new TextEncoder().encode(input).length;
}

describe('F11: analyzeText degrades instead of throwing without Intl.Segmenter', () => {
  const segmenterDescriptor = Object.getOwnPropertyDescriptor(Intl, 'Segmenter');

  afterEach(() => {
    if (segmenterDescriptor) {
      Object.defineProperty(Intl, 'Segmenter', segmenterDescriptor);
    }
  });

  test('with Intl.Segmenter present, a ZWJ family sequence counts as one grapheme', () => {
    expect(typeof Intl.Segmenter).toBe('function');

    const result = analyzeText(ZWJ_FAMILY);

    expect(result.stats.graphemeCount).toBe(1);
    expect(result.stats.graphemeClusteringDegraded).toBe(false);
    expect(result.stats.codePointCount).toBe(independentCodePointCount(ZWJ_FAMILY));
    expect(result.stats.utf16Length).toBe(ZWJ_FAMILY.length);
    expect(result.stats.utf8ByteCount).toBe(independentUtf8ByteCount(ZWJ_FAMILY));
  });

  test('with Intl.Segmenter absent, analyzeText does not throw and still reports correct counts', () => {
    Object.defineProperty(Intl, 'Segmenter', {
      configurable: true,
      value: undefined,
    });

    let result: ReturnType<typeof analyzeText> | undefined;
    expect(() => {
      result = analyzeText(ZWJ_FAMILY);
    }).not.toThrow();

    expect(result).toBeDefined();
    expect(result!.stats.graphemeClusteringDegraded).toBe(true);
    // Degraded path splits by code point, so each code point is its own
    // "grapheme" -- visibly different from the clustered count of 1 above.
    expect(result!.stats.graphemeCount).toBe(independentCodePointCount(ZWJ_FAMILY));
    expect(result!.stats.codePointCount).toBe(independentCodePointCount(ZWJ_FAMILY));
    expect(result!.stats.utf16Length).toBe(ZWJ_FAMILY.length);
    expect(result!.stats.utf8ByteCount).toBe(independentUtf8ByteCount(ZWJ_FAMILY));
  });
});

describe('useUnicodeAnalyzer copyResults', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: originalClipboard,
    });
  });

  test('reports success when the clipboard write succeeds', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    const { result } = renderHook(() => useUnicodeAnalyzer());

    act(() => {
      result.current.setInput('hello');
    });
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current.result).not.toBeNull();

    await act(async () => {
      await result.current.copyResults();
    });

    expect(writeText).toHaveBeenCalled();
    expect(result.current.copyStatus).toBe('success');
  });

  test('reports failure instead of throwing/rejecting when the clipboard write is denied', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });
    const originalExecCommand = document.execCommand;
    document.execCommand = jest.fn().mockReturnValue(false);

    const { result } = renderHook(() => useUnicodeAnalyzer());

    act(() => {
      result.current.setInput('hello');
    });
    act(() => {
      jest.advanceTimersByTime(150);
    });

    await act(async () => {
      await result.current.copyResults();
    });

    expect(result.current.copyStatus).toBe('error');
    document.execCommand = originalExecCommand;
  });

  test('copy feedback self-clears back to idle after the timeout', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    const { result } = renderHook(() => useUnicodeAnalyzer());

    act(() => {
      result.current.setInput('hello');
    });
    act(() => {
      jest.advanceTimersByTime(150);
    });
    await act(async () => {
      await result.current.copyResults();
    });
    expect(result.current.copyStatus).toBe('success');

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.copyStatus).toBe('idle');
  });
});

describe('AnalyzerView surfaces degraded grapheme clustering and copy feedback', () => {
  const baseResult = analyzeText('hello');
  const noop = () => {};
  const noopAsync = async () => {};

  test('shows a notice when graphemeClusteringDegraded is true', () => {
    render(
      React.createElement(AnalyzerView, {
        input: 'hello',
        setInput: noop,
        decomposeEmojis: false,
        setDecomposeEmojis: noop,
        result: {
          ...baseResult,
          stats: { ...baseResult.stats, graphemeClusteringDegraded: true },
        },
        isAnalyzing: false,
        clear: noop,
        loadExample: noop,
        copyResults: noopAsync,
        copyStatus: 'idle',
      }),
    );

    expect(
      screen.getByText(/Grapheme clustering isn.t supported in this browser/i),
    ).not.toBeNull();
  });

  test('does not show the notice when clustering is accurate', () => {
    render(
      React.createElement(AnalyzerView, {
        input: 'hello',
        setInput: noop,
        decomposeEmojis: false,
        setDecomposeEmojis: noop,
        result: baseResult,
        isAnalyzing: false,
        clear: noop,
        loadExample: noop,
        copyResults: noopAsync,
        copyStatus: 'idle',
      }),
    );

    expect(
      screen.queryByText(/Grapheme clustering isn.t supported in this browser/i),
    ).toBeNull();
  });

  test('shows "Copy failed." when copyStatus is error, and "Copied!" on success', () => {
    const { rerender } = render(
      React.createElement(AnalyzerView, {
        input: 'hello',
        setInput: noop,
        decomposeEmojis: false,
        setDecomposeEmojis: noop,
        result: baseResult,
        isAnalyzing: false,
        clear: noop,
        loadExample: noop,
        copyResults: noopAsync,
        copyStatus: 'error',
      }),
    );

    expect(screen.getByRole('status').textContent).toBe('Copy failed.');

    rerender(
      React.createElement(AnalyzerView, {
        input: 'hello',
        setInput: noop,
        decomposeEmojis: false,
        setDecomposeEmojis: noop,
        result: baseResult,
        isAnalyzing: false,
        clear: noop,
        loadExample: noop,
        copyResults: noopAsync,
        copyStatus: 'success',
      }),
    );

    expect(screen.getByRole('button', { name: 'Copied!' })).not.toBeNull();
  });

  // Reviewer note per Task 1's follow-up: copy feedback must not stay stuck --
  // it self-clears (same pattern as csvtomd), verified end to end through the
  // real hook wired to the real view, the same way page.tsx wires them.
  test('copy feedback self-clears after the timeout (hook + view, end to end)', async () => {
    jest.useFakeTimers();
    const originalClipboard = navigator.clipboard;
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    function Harness() {
      const vm = useUnicodeAnalyzer();
      return React.createElement(AnalyzerView, vm);
    }

    render(React.createElement(Harness));

    fireEvent.change(
      screen.getByPlaceholderText(
        'Enter or paste text to analyze Unicode characters and emojis...',
      ),
      { target: { value: 'hello' } },
    );

    act(() => {
      jest.advanceTimersByTime(150);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy Results' }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: 'Copied!' })).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: 'Copy Results' })).not.toBeNull();

    jest.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: originalClipboard,
    });
  });
});

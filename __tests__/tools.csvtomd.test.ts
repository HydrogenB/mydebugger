import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { detectDelimiter, parseCsv, generateMarkdownTable } from '../src/tools/csvtomd/lib/csvtomd';
import { useCsvtomd } from '../src/tools/csvtomd/hooks/useCsvtomd';
import { CsvtomdView } from '../src/tools/csvtomd/components/CsvtomdPanel';

// Renders the real hook wired to the real presentational component, the same
// way page.tsx does, so the copy-feedback reset is verified end to end
// through the rendered `role="status"` output rather than only hook state.
function CsvtomdHarness() {
  const vm = useCsvtomd();
  return React.createElement(CsvtomdView, vm);
}

describe('CSV to Markdown', () => {
  test('detectDelimiter chooses comma', () => {
    const d = detectDelimiter('a,b\nc,d');
    expect(d).toBe(',');
  });

  test('parseCsv returns data', () => {
    const res = parseCsv('a,b\n1,2', ',');
    expect(res.data).toEqual([{ a: '1', b: '2' }]);
  });

  test('generateMarkdownTable outputs table', () => {
    const md = generateMarkdownTable([{ a: '1', b: '2' }], ['left', 'right']);
    expect(md).toContain('| a | b |');
  });

  // F5: the dead `hasHeader` heuristic is deleted (it could not distinguish a
  // header row from a data row). The first row is documented as always the
  // header row, so a CSV with no real header row loses its first row to
  // column naming — this is expected, unsupported-headerless-CSV behavior.
  test('F5: the first row is always treated as the header (headerless CSV unsupported)', () => {
    const res = parseCsv('1,2\n3,4', ',');
    expect(res.data).toEqual([{ '1': '3', '2': '4' }]);
  });

  // F4: headers must be escaped exactly like cells, and CR/LF inside a cell
  // or header must become <br> so one logical row stays one physical line.
  describe('F4: escaping', () => {
    test('escapes a pipe character in a header', () => {
      const res = parseCsv('a|b,c\n1,2', ',');
      const md = generateMarkdownTable(res.data, ['left', 'left']);
      expect(md.split('\n')[0]).toBe('| a\\|b | c |');
    });

    test('keeps a multi-line quoted cell on a single physical table row', () => {
      const res = parseCsv('a,b\n1,"line1\nline2"', ',');
      const md = generateMarkdownTable(res.data, ['left', 'left']);
      const lines = md.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[2]).toBe('| 1 | line1<br>line2 |');
    });
  });

  // F3: generateMarkdownTable must defend itself, independent of any caller.
  describe('F3: generateMarkdownTable pads/truncates alignment to the header count', () => {
    test('pads a short alignment array, defaulting new columns to left', () => {
      const md = generateMarkdownTable([{ a: '1', b: '2', c: '3' }], ['right']);
      const lines = md.split('\n');
      expect(lines[0].split('|')).toHaveLength(lines[1].split('|').length);
      expect(lines[1]).toBe('| ---: | :--- | :--- |');
    });

    test('truncates an alignment array longer than the header count', () => {
      const md = generateMarkdownTable(
        [{ a: '1', b: '2' }],
        ['right', 'center', 'right', 'right'],
      );
      expect(md.split('\n')[1]).toBe('| ---: | :---: |');
    });
  });
});

describe('useCsvtomd', () => {
  // F2: auto-detect on fresh input, explicit choice wins and survives edits.
  describe('F2: delimiter selection', () => {
    test('auto-detects the delimiter for fresh CSV input', () => {
      const { result } = renderHook(() => useCsvtomd());

      act(() => {
        result.current.setCsv('a;b\n1;2');
      });

      expect(result.current.delimiter).toBe(';');
      expect(result.current.data).toEqual([{ a: '1', b: '2' }]);
    });

    test('an explicit delimiter choice takes effect immediately and survives continued edits', () => {
      const { result } = renderHook(() => useCsvtomd());

      // Auto-detect ties comma vs semicolon; comma wins (first in the candidate list).
      act(() => {
        result.current.setCsv('a,b;c\n1,2;3');
      });
      expect(result.current.delimiter).toBe(',');
      expect(result.current.data).toEqual([{ a: '1', 'b;c': '2;3' }]);

      // User explicitly overrides — must re-parse immediately with the new delimiter.
      act(() => {
        result.current.setDelimiter(';');
      });
      expect(result.current.delimiter).toBe(';');
      expect(result.current.data).toEqual([{ 'a,b': '1,2', c: '3' }]);

      // Continuing to edit the same CSV must not clobber the explicit choice.
      act(() => {
        result.current.setCsv('a,b;c\n1,2;3\n4,5;6');
      });
      expect(result.current.delimiter).toBe(';');
      expect(result.current.data).toEqual([
        { 'a,b': '1,2', c: '3' },
        { 'a,b': '4,5', c: '6' },
      ]);
    });

    test('clearing the CSV re-enables auto-detection for the next fresh input', () => {
      const { result } = renderHook(() => useCsvtomd());

      act(() => {
        result.current.setCsv('a,b\n1,2');
        result.current.setDelimiter(';');
      });
      act(() => {
        result.current.setCsv('');
      });
      act(() => {
        result.current.setCsv('x|y\n1|2');
      });

      expect(result.current.delimiter).toBe('|');
    });
  });

  // F3: the alignment array must track the column count in both directions.
  test('F3: alignment tracks column count both ways, preserving existing choices', () => {
    const { result } = renderHook(() => useCsvtomd());

    act(() => {
      result.current.setCsv('a,b,c\n1,2,3');
    });
    expect(result.current.alignment).toEqual(['left', 'left', 'left']);

    act(() => {
      result.current.toggleAlignment(1);
    });
    expect(result.current.alignment[1]).toBe('center');

    act(() => {
      result.current.setCsv('a,b,c,d,e\n1,2,3,4,5');
    });
    expect(result.current.alignment).toEqual(['left', 'center', 'left', 'left', 'left']);

    act(() => {
      result.current.setCsv('a,b\n1,2');
    });
    expect(result.current.alignment).toEqual(['left', 'center']);
  });

  // F10: Firefox requires the anchor to be attached to the document when clicked.
  test('F10: download appends the anchor before clicking, then removes it and revokes the URL', () => {
    const { result } = renderHook(() => useCsvtomd());
    act(() => {
      result.current.setCsv('a,b\n1,2');
    });

    const createObjectURL = jest.fn().mockReturnValue('blob:mock');
    const revokeObjectURL = jest.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    let wasInDocumentAtClick = false;
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function clickMock(this: HTMLAnchorElement) {
        wasInDocumentAtClick = document.body.contains(this);
      });

    act(() => {
      result.current.downloadMarkdown();
    });

    expect(wasInDocumentAtClick).toBe(true);
    expect(document.querySelector('a[download="table.md"]')).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');

    clickSpy.mockRestore();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  // Also in this task: copyMarkdown routes through the shared copyText helper
  // and surfaces success/failure instead of an unhandled rejection.
  describe('copyMarkdown', () => {
    const originalClipboard = navigator.clipboard;

    afterEach(() => {
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

      const { result } = renderHook(() => useCsvtomd());
      act(() => {
        result.current.setCsv('a,b\n1,2');
      });

      await act(async () => {
        await result.current.copyMarkdown();
      });

      expect(writeText).toHaveBeenCalledWith(result.current.markdown);
      expect(result.current.copyStatus).toBe('success');
    });

    test('reports failure instead of throwing when the clipboard write is denied', async () => {
      const writeText = jest.fn().mockRejectedValue(new Error('denied'));
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        writable: true,
        value: { writeText },
      });
      const originalExecCommand = document.execCommand;
      document.execCommand = jest.fn().mockReturnValue(false);

      const { result } = renderHook(() => useCsvtomd());
      act(() => {
        result.current.setCsv('a,b\n1,2');
      });

      await act(async () => {
        await result.current.copyMarkdown();
      });

      expect(result.current.copyStatus).toBe('error');
      document.execCommand = originalExecCommand;
    });
  });

  // Also in this task: a failed file read must surface through `error`.
  test('uploadFile sets an error when the file cannot be read', () => {
    const { result } = renderHook(() => useCsvtomd());

    const fakeReader = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      readAsText: jest.fn(),
    };
    const FileReaderSpy = jest
      .spyOn(global, 'FileReader')
      .mockImplementation(() => fakeReader as unknown as FileReader);

    act(() => {
      result.current.uploadFile(new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' }));
    });
    act(() => {
      fakeReader.onerror?.();
    });

    expect(result.current.error).toBe('Could not read the selected file');

    FileReaderSpy.mockRestore();
  });
});

// Reviewer follow-up: copyStatus must not stay stuck forever — it self-clears
// after a short timeout (same pattern as useCookieInspector's toast), so a
// stale "Copied to clipboard." message can never sit next to markdown that
// was never actually copied.
describe('CsvtomdView copy feedback reset (component)', () => {
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

  test('the rendered copy-feedback status clears itself after the timeout', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    render(React.createElement(CsvtomdHarness));

    fireEvent.change(screen.getByPlaceholderText('Paste CSV here'), {
      target: { value: 'a,b\n1,2' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
      await Promise.resolve();
    });

    expect(screen.getByRole('status').textContent).toBe('Copied to clipboard.');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByRole('status')).toBeNull();
  });
});

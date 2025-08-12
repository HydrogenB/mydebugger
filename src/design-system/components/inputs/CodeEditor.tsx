import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'json' | 'text';
  placeholder?: string;
  ariaLabel?: string;
  lineNumbers?: boolean;
  minRows?: number;
  className?: string;
  invalid?: boolean;
  onSubmit?: () => void; // Triggered on Ctrl/Cmd+Enter
  showToolbar?: boolean; // Show minimal toolbar (wrap/copy/font)
  enableHighlight?: boolean; // Enable overlay highlighting (json only)
}

/**
 * Lightweight code editor built on a textarea with a synchronized line-number gutter.
 * No external dependencies; optimized for JSON/text editing in tools.
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'text',
  placeholder,
  ariaLabel,
  lineNumbers = true,
  minRows = 16,
  className = '',
  invalid = false,
  onSubmit,
  showToolbar = false,
  enableHighlight = true,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLPreElement | null>(null);
  const [wrap, setWrap] = useState(true);
  const [fontSize, setFontSize] = useState(12);

  const lines = useMemo(() => Math.max(1, value.split('\n').length), [value]);

  // Sync scroll position between textarea and gutter
  const syncScroll = useCallback(() => {
    if (!textAreaRef.current || !gutterRef.current) return;
    gutterRef.current.scrollTop = textAreaRef.current.scrollTop;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = textAreaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textAreaRef.current.scrollLeft;
    }
  }, []);

  // Handle Tab indentation and simple auto-pairs for JSON ([, {, ")
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    // Submit: Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
      return;
    }

    // Indent with Tab (two spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const indent = '  ';
      const before = value.slice(0, start);
      const after = value.slice(end);
      const newValue = `${before}${indent}${after}`;
      onChange(newValue);
      // set caret after indent on next tick
      requestAnimationFrame(() => {
        if (textAreaRef.current) {
          const pos = start + indent.length;
          textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = pos;
        }
      });
      return;
    }

    // Auto-pair JSON quotes/brackets when no selection
    if (start === end && (e.key === '"' || e.key === '{' || e.key === '[')) {
      e.preventDefault();
      const pair = e.key === '"' ? '"' : e.key === '{' ? '}' : ']';
      const before = value.slice(0, start);
      const after = value.slice(end);
      const newValue = `${before}${e.key}${pair}${after}`;
      onChange(newValue);
      requestAnimationFrame(() => {
        if (textAreaRef.current) {
          const pos = start + 1;
          textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = pos;
        }
      });
      return;
    }
  }, [value, onChange, onSubmit]);

  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    const handler = () => syncScroll();
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [syncScroll]);

  const rowStyle = useMemo(() => ({
    minHeight: `${minRows * 20}px`,
  }), [minRows]);

  // --- Syntax Highlighting for JSON ---
  const escapeHtml = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  type Token = { text: string; className?: string };

  const highlightJson = (src: string): string => {
    const out: Token[] = [];
    let i = 0;

    const push = (text: string, cls?: string) => out.push({ text, className: cls });

    const isDigit = (c: string) => /[0-9]/.test(c);
    const isWhitespace = (c: string) => /\s/.test(c);
    const idRegex = /^(true|false|null)/;

    while (i < src.length) {
      const ch = src[i];
      // Strings
      if (ch === '"') {
        let j = i + 1;
        let escaped = false;
        while (j < src.length) {
          const cj = src[j];
          if (!escaped && cj === '"') { j++; break; }
          escaped = !escaped && cj === '\\';
          j++;
        }
        const str = src.slice(i, j);
        // Determine if this is a key: lookahead for optional spaces then :
        let k = j;
        while (k < src.length && isWhitespace(src[k])) k++;
        const isKey = src[k] === ':';
        push(str, isKey ? 'text-teal-600 dark:text-teal-400' : 'text-green-600 dark:text-green-400');
        i = j;
        continue;
      }
      // Numbers
      if (ch === '-' || isDigit(ch)) {
        const numMatch = src.slice(i).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
        if (numMatch) {
          push(numMatch[0], 'text-blue-600 dark:text-blue-400');
          i += numMatch[0].length;
          continue;
        }
      }
      // Literals: true/false/null
      const lit = src.slice(i).match(idRegex);
      if (lit) {
        push(lit[0], 'text-purple-600 dark:text-purple-400');
        i += lit[0].length;
        continue;
      }
      // Punctuation
      if ('{}[]:,'.includes(ch)) {
        push(ch, 'text-gray-500 dark:text-gray-400');
        i++;
        continue;
      }
      // Other (whitespace)
      push(ch);
      i++;
    }
    return out.map(t => t.className ? `<span class="${t.className}">${escapeHtml(t.text)}</span>` : escapeHtml(t.text)).join('');
  };

  const highlightedHtml = useMemo(() => {
    if (!(enableHighlight && language === 'json')) return '';
    try {
      return highlightJson(value);
    } catch {
      return escapeHtml(value);
    }
  }, [value, enableHighlight, language]);

  // Cursor position -> line/column
  const [cursor, setCursor] = useState({ line: 1, col: 1, sel: 0 });
  const updateCursor = useCallback(() => {
    const el = textAreaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? 0;
    const upTo = value.slice(0, pos);
    const line = upTo.split('\n').length;
    const lastNl = upTo.lastIndexOf('\n');
    const col = pos - (lastNl >= 0 ? lastNl + 1 : 0) + 1;
    const sel = Math.abs((el.selectionEnd ?? pos) - pos);
    setCursor({ line, col, sel });
  }, [value]);

  useEffect(() => {
    updateCursor();
  }, [value, updateCursor]);

  return (
    <div className={`relative w-full border ${invalid ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md bg-white dark:bg-gray-900 ${className}`}>
      {showToolbar && (
        <div className="flex items-center justify-between px-2 py-1 border-b border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setWrap(!wrap)} title={wrap ? 'Disable wrap' : 'Enable wrap'}>
              {wrap ? 'Wrap: On' : 'Wrap: Off'}
            </button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => navigator.clipboard?.writeText(value)} title="Copy">
              Copy
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span>Font</span>
            <input type="range" min={12} max={18} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} />
          </div>
        </div>
      )}
      <div className="flex relative">
        {lineNumbers && (
          <div
            ref={gutterRef}
            className="select-none text-right pr-3 pl-2 py-2 text-xs leading-5 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 overflow-hidden border-r border-gray-200 dark:border-gray-800"
            style={{ width: 48, maxHeight: '64vh' }}
            aria-hidden
          >
            {/* Render line numbers */}
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="h-5">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        {/* Highlight overlay (behind textarea) */}
        {enableHighlight && (
          <pre
            ref={overlayRef}
            className="absolute inset-0 pointer-events-none m-0 p-2 font-mono text-sm leading-5 text-transparent whitespace-pre"
            style={{ maxHeight: '64vh', overflow: 'auto', whiteSpace: wrap ? 'pre-wrap' as const : 'pre' as const, tabSize: 2, fontSize }}
            aria-hidden
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
        <textarea
          ref={textAreaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onKeyUp={updateCursor}
          onClick={updateCursor}
          aria-label={ariaLabel || (language === 'json' ? 'JSON code editor' : 'Code editor')}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 p-2 font-mono text-sm leading-5 bg-transparent text-gray-900 dark:text-gray-100 outline-none resize-none overflow-auto relative"
          style={{ maxHeight: '64vh', ...rowStyle, whiteSpace: wrap ? 'pre-wrap' : 'pre', tabSize: 2, fontSize }}
        />
      </div>
      {/* Status strip */}
      <div className="flex items-center justify-between text-xs px-2 py-1 border-t border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-2">
          <span>{language.toUpperCase()}</span>
          <span>·</span>
          <span>{lines} lines</span>
        </span>
        <span>Ln {cursor.line}, Col {cursor.col}{cursor.sel ? ` (Sel ${cursor.sel})` : ''}</span>
      </div>
    </div>
  );
};

export default CodeEditor;
export { CodeEditor };



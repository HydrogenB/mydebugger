/**
 * Random Password Generator UI with multiple modes (UUID, Key, Password).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@design-system/components/inputs/Button';
import { Card } from '@design-system/components/layout/Card';
import { ProgressBar } from '@design-system/components/feedback/ProgressBar';
import { SelectInput } from '@design-system/components/inputs/SelectInput';
import './CopyAnimation.css';
import { generatePassword, estimateStrength, PasswordOptions, generateUUIDv4, generateKey, KeyOptions } from '../lib/generators';
import { logEvent } from '../../../lib/analytics';

type Mode = 'password' | 'uuid' | 'key';

const defaultPasswordOptions: PasswordOptions = {
  length: 16,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: true,
};

export const GeneratorPanel: React.FC = () => {
  const [mode, setMode] = useState<Mode>('password');
  const [passOpts, setPassOpts] = useState<PasswordOptions>(() => {
    // restore last settings
    try {
      const raw = localStorage.getItem('rpg_options');
      return raw ? { ...defaultPasswordOptions, ...JSON.parse(raw) } : defaultPasswordOptions;
    } catch { return defaultPasswordOptions; }
  });
  const [keyOpts, setKeyOpts] = useState<KeyOptions>({ bits: 256, format: 'hex' });
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [regenSpin, setRegenSpin] = useState<boolean>(false);
  const copyAnimateRef = useRef<HTMLDivElement | null>(null);

  // Generate on mount and whenever options change
  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, passOpts, keyOpts.bits, keyOpts.format]);

  useEffect(() => {
    try { localStorage.setItem('rpg_options', JSON.stringify(passOpts)); } catch {}
  }, [passOpts]);

  const strength = useMemo(() => {
    if (mode !== 'password') return null;
    return estimateStrength(passOpts, output || '');
  }, [mode, passOpts, output]);

  function regenerate() {
    if (mode === 'uuid') {
      setOutput(generateUUIDv4());
    } else if (mode === 'key') {
      setOutput(generateKey(keyOpts));
    } else {
      setOutput(generatePassword(passOpts));
    }
    try { logEvent('rpg_regenerate', { mode }); } catch {}
  }

  function handleRegenerate() {
    setRegenSpin(true);
    regenerate();
    setTimeout(() => setRegenSpin(false), 700);
  }

  async function copyToClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(output);
      } else {
        const ta = document.createElement('textarea');
        ta.value = output;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      // simple burst dots to mimic micro-animation feedback
      const container = copyAnimateRef.current;
      if (container) {
        const burst = document.createElement('div');
        burst.className = 'copy-burst';
        for (let i = 0; i < 8; i++) {
          const dot = document.createElement('span');
          const angle = (i / 8) * 2 * Math.PI;
          const radius = 14;
          dot.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
          dot.style.setProperty('--y', `${Math.sin(angle) * radius}px`);
          burst.appendChild(dot);
        }
        container.appendChild(burst);
        setTimeout(() => burst.remove(), 650);
      }
      setTimeout(() => setCopied(false), 1600);
      try { logEvent('rpg_copy', { mode, length: output.length }); } catch {}
    } catch {}
  }

  const strengthBadge = useMemo(() => {
    if (!strength) return null;
    const map: Record<string, { bg: string; text: string }> = {
      'Very weak': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-200' },
      Weak: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-200' },
      Good: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200' },
      Strong: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-200' },
      'Very strong': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-200' },
    };
    return map[strength.label] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-200' };
  }, [strength]);

  return (
    <div className="space-y-6">
      <Card
        title="Generator"
        subtitle="Generated locally via Web Crypto; never transmitted."
        className="overflow-visible"
        actions={
          <div className="flex flex-wrap gap-2 justify-end">
            <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
              {[{ id: 'password', label: 'Password' }, { id: 'uuid', label: 'UUID' }, { id: 'key', label: 'Key' }].map((t) => (
                <button
                  key={t.id}
                  className={`px-3 py-1.5 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${mode === t.id ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-700 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  onClick={() => setMode(t.id as Mode)}
                  aria-pressed={mode === t.id}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-3" onDoubleClick={handleRegenerate}>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-3">
              <textarea
                className="w-full min-h-[52px] resize-none bg-transparent outline-none font-mono text-sm sm:text-base leading-6 text-gray-900 dark:text-gray-100"
                value={output}
                readOnly
                aria-label="Generated output"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                {mode === 'password' && strength && strengthBadge && (
                  <span className={`text-xs px-2.5 py-1 rounded-full ${strengthBadge.bg} ${strengthBadge.text}`}>
                    {strength.label}
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">Length: {output.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative" ref={copyAnimateRef}>
                  <Button size="sm" onClick={copyToClipboard} aria-live="polite" disabled={!output}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={handleRegenerate}
                >
                  <span className={`inline-flex items-center ${regenSpin ? 'transition-transform rotate-180' : 'transition-transform'}`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 10-7.906 8"/></svg>
                  </span>
                  <span className="ml-2">Regenerate</span>
                </Button>
              </div>
            </div>

            {mode === 'password' && strength && (
              <div className="pt-2">
                <ProgressBar value={strength.score} />
              </div>
            )}
          </div>

          {mode === 'password' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <label className="block text-sm font-medium">Password length</label>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{passOpts.length}</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={passOpts.length}
                  onChange={(e) => setPassOpts({ ...passOpts, length: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <div className="flex flex-wrap gap-2">
                  {[12, 16, 20, 24, 32].map((v) => (
                    <button
                      key={v}
                      onClick={() => setPassOpts({ ...passOpts, length: v })}
                      className={`px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${passOpts.length === v ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-200' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Character sets</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { key: 'includeUppercase', label: 'Uppercase', hint: 'ABC' },
                    { key: 'includeLowercase', label: 'Lowercase', hint: 'abc' },
                    { key: 'includeNumbers', label: 'Numbers', hint: '123' },
                    { key: 'includeSymbols', label: 'Symbols', hint: '#$&' },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-gray-900/20 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={(passOpts as any)[opt.key]}
                        onChange={(e) => setPassOpts({ ...(passOpts as any), [opt.key]: e.target.checked })}
                      />
                      <span className="flex-1">{opt.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{opt.hint}</span>
                    </label>
                  ))}

                  <label className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-gray-900/20 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={passOpts.excludeAmbiguous}
                      onChange={(e) => setPassOpts({ ...passOpts, excludeAmbiguous: e.target.checked })}
                    />
                    <span className="flex-1">Avoid ambiguous characters</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">O/0, l/1</span>
                  </label>

                  {!(passOpts.includeLowercase || passOpts.includeUppercase || passOpts.includeNumbers || passOpts.includeSymbols) && (
                    <div className="sm:col-span-2 text-xs text-red-600">Select at least one character set.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === 'key' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <SelectInput
                label="Key size"
                className="mb-0"
                value={String(keyOpts.bits)}
                onChange={(value) => setKeyOpts({ ...keyOpts, bits: parseInt(value) as KeyOptions['bits'] })}
                options={[
                  { value: '128', label: '128-bit' },
                  { value: '192', label: '192-bit' },
                  { value: '256', label: '256-bit' },
                ]}
              />
              <SelectInput
                label="Format"
                className="mb-0"
                value={keyOpts.format}
                onChange={(value) => setKeyOpts({ ...keyOpts, format: value as KeyOptions['format'] })}
                options={[
                  { value: 'hex', label: 'Hex' },
                  { value: 'base64', label: 'Base64' },
                ]}
              />
              <div className="lg:col-span-2 text-sm text-gray-500 dark:text-gray-400">
                Use for API keys, secrets, or test tokens. Store securely.
              </div>
            </div>
          )}

          {mode === 'uuid' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              UUID v4 generated with Web Crypto.
            </div>
          )}
        </div>
      </Card>

      <Card title="Best practices" className="text-sm">
        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
          <li>Use 16+ characters and include multiple character sets.</li>
          <li>Never reuse passwords. Store them in a trusted manager.</li>
          <li>All generation happens locally in your browser.</li>
        </ul>
        <div className="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</div>
      </Card>
    </div>
  );
};

export default GeneratorPanel;



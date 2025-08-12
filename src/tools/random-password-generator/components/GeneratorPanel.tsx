/**
 * Random Password Generator UI with multiple modes (UUID, Key, Password).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@design-system/components/inputs/Button';
import { Card } from '@design-system/components/layout/Card';
import { Tooltip } from '@design-system/components/overlays/Tooltip';
import { ProgressBar } from '@design-system/components/feedback/ProgressBar';
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
  const [spin, setSpin] = useState<boolean>(false);
  const animateRef = useRef<HTMLDivElement | null>(null);

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
      setSpin(true);
      // simple burst dots to mimic micro-animation feedback
      const container = animateRef.current;
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
      setTimeout(() => setSpin(false), 800);
      setTimeout(() => setCopied(false), 1600);
      try { logEvent('rpg_copy', { mode, length: output.length }); } catch {}
    } catch {}
  }

  return (
    <div className="space-y-6">
      <Card title="Generator" className="overflow-visible">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
              {[{id:'password',label:'Password'},{id:'uuid',label:'UUID'},{id:'key',label:'Key'}].map((t) => (
                <button
                  key={t.id}
                  className={`px-3 py-1 rounded-lg text-sm ${mode===t.id? 'bg-white dark:bg-gray-700 shadow text-primary-600':'text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setMode(t.id as Mode)}
                  aria-pressed={mode===t.id}
                >{t.label}</button>
              ))}
            </div>
            <div className={`ml-auto transition-transform ${spin? 'rotate-180':''}`} ref={animateRef}>
              <Tooltip content="Regenerate">
                <Button size="sm" onClick={regenerate}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 10-7.906 8"/></svg>
                </Button>
              </Tooltip>
            </div>
          </div>

          <div className="relative" onDoubleClick={regenerate}>
            <input
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 font-mono text-base"
              value={output}
              onChange={(e)=> setOutput(e.target.value)}
              readOnly
              aria-label="Generated output"
              onFocus={(e)=> e.currentTarget.select()}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {mode==='password' && strength && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">{strength.label}</span>
              )}
              <Button size="sm" onClick={copyToClipboard} aria-live="polite" disabled={!output}>
                {copied? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {mode==='password' && strength && (
            <div className="mt-1">
              <ProgressBar value={strength.score} />
              <p className="text-xs text-gray-500 mt-1">Generated locally via Web Crypto; never transmitted.</p>
            </div>
          )}

          {mode==='password' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password length: {passOpts.length}</label>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={passOpts.length}
                  onChange={(e)=> setPassOpts({...passOpts, length: parseInt(e.target.value)})}
                  className="w-full accent-blue-500"
                />
                <div className="flex gap-2 mt-2">
                  {[12,16,20,24,32].map(v => (
                    <button key={v} onClick={()=> setPassOpts({...passOpts, length: v})} className={`px-2 py-0.5 text-xs rounded border ${passOpts.length===v? 'bg-primary-50 border-primary-300 text-primary-700':'border-gray-300'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'includeUppercase', label: 'ABC' },
                  { key: 'includeLowercase', label: 'abc' },
                  { key: 'includeNumbers', label: '123' },
                  { key: 'includeSymbols', label: '#$&' },
                  { key: 'excludeAmbiguous', label: 'Avoid O/0 l/1' },
                ].map((opt) => (
                  <label key={opt.key} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(passOpts as any)[opt.key]}
                      onChange={(e)=> setPassOpts({ ...(passOpts as any), [opt.key]: e.target.checked })}
                    />
                    {opt.label}
                  </label>
                ))}
                {!(passOpts.includeLowercase||passOpts.includeUppercase||passOpts.includeNumbers||passOpts.includeSymbols) && (
                  <div className="col-span-2 text-xs text-red-600">Select at least one character set.</div>
                )}
              </div>
            </div>
          )}

          {mode==='key' && (
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bits</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  value={keyOpts.bits}
                  onChange={(e)=> setKeyOpts({ ...keyOpts, bits: parseInt(e.target.value) as KeyOptions['bits'] })}
                >
                  <option value={128}>128</option>
                  <option value={192}>192</option>
                  <option value={256}>256</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  value={keyOpts.format}
                  onChange={(e)=> setKeyOpts({ ...keyOpts, format: e.target.value as KeyOptions['format'] })}
                >
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={regenerate} className="w-full">Generate</Button>
              </div>
            </div>
          )}

          {mode==='uuid' && (
            <div className="text-sm text-gray-500">UUID v4 generated with Web Crypto</div>
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



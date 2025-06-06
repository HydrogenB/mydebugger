'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { useState } from 'react';
import Link from 'next/link';
import { useThemeContext } from './ThemeRegistry';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { mode, toggleMode } = useThemeContext();

  return (
    <nav className="bg-blue-600 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <button
          className="sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          ☰
        </button>
        <Link href="/" className="text-lg font-semibold">
          MyDebugger
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            aria-label="toggle theme"
            className="rounded p-1 hover:bg-blue-500"
          >
            {mode === 'light' ? '🌙' : '☀️'}
          </button>
          <Link href="/#tools" className="hidden sm:inline-block hover:underline">
            Tools
          </Link>
          <Link href="/about" className="hidden sm:inline-block hover:underline">
            About
          </Link>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-2 sm:hidden">
          <Link href="/#tools" className="block py-1" onClick={() => setOpen(false)}>
            Tools
          </Link>
          <Link href="/about" className="block py-1" onClick={() => setOpen(false)}>
            About
          </Link>
        </div>
      )}
    </nav>
  );
}

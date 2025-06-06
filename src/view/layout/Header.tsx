"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import Link from "next/link";
import { useState } from "react";
import { useThemeContext } from "@/components/layout/ThemeRegistry";

interface HeaderProps {
  links?: { href: string; label: string }[];
}

export default function Header({ links = [] }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const { mode, toggleMode } = useThemeContext();

  return (
    <header className="sticky top-0 z-20 bg-blue-600 text-white shadow hc:bg-black hc:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <button
          className="sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          ☰
        </button>
        <Link href="/" className="flex items-center gap-1 text-lg font-semibold">
          <span aria-hidden>🛠️</span>
          MyDebugger
        </Link>
        <div className="flex items-center gap-2 hc:text-white">
          <button
            onClick={toggleMode}
            aria-label="toggle theme"
            className="rounded p-1 hover:bg-blue-500"
          >
            {mode === "light" ? "🌙" : "☀️"}
          </button>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden sm:inline-block hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      {open && (
        <nav className="px-4 pb-2 sm:hidden hc:text-white">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

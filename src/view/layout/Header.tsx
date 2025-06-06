"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import Link from "next/link";
import { useState } from "react";
import { useThemeContext } from "@/components/layout/ThemeRegistry";
import { Button } from "@/view/ui";

interface HeaderProps {
  links?: { href: string; label: string }[];
}

export default function Header({ links = [] }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const { mode, toggleMode } = useThemeContext();

  return (
    <header className="sticky top-0 z-20 bg-blue-600 text-white shadow hc:bg-black hc:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Button
          variant="ghost"
          size="sm"
          className="sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          ☰
        </Button>
        <Link href="/" className="flex items-center gap-1 text-lg font-semibold">
          <span aria-hidden>🛠️</span>
          MyDebugger
        </Link>
        <div className="flex items-center gap-2 hc:text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMode}
            aria-label="toggle theme"
            className="p-1"
          >
            {mode === "light" ? "🌙" : "☀️"}
          </Button>
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

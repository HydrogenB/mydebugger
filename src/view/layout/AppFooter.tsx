"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import Link from "next/link";
import { ReactNode } from "react";

interface FooterLink {
  href: string;
  label: string;
}

interface AppFooterProps {
  links?: FooterLink[];
  socials?: ReactNode;
}

export default function AppFooter({ links = [], socials }: AppFooterProps) {
  return (
    <footer className="mt-auto bg-gray-200 py-4 text-sm dark:bg-gray-700 hc:bg-white hc:text-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-2 sm:flex-row">
        <div className="flex gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {l.label}
            </Link>
          ))}
        </div>
        {socials && <div className="flex gap-2">{socials}</div>}
        <div className="text-gray-600 dark:text-gray-300 hc:text-black">
          © {new Date().getFullYear()} MyDebugger
        </div>
      </div>
    </footer>
  );
}

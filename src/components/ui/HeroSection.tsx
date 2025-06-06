'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { ChangeEvent } from 'react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function HeroSection({ searchQuery, onSearchChange }: HeroSectionProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <section className="bg-white py-6 dark:bg-gray-800">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-4xl font-bold text-blue-600">MyDebugger</h1>
        <p className="mb-4 mt-2 text-lg text-gray-600 dark:text-gray-300">
          Your comprehensive toolkit for web and app debugging
        </p>
        <div className="mx-auto flex max-w-xl flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Search tools..."
            className="flex-grow rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Search
          </button>
        </div>
      </div>
    </section>
  );
}

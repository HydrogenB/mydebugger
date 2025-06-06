"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { ChangeEvent, FormEvent } from "react";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function HeroSection({
  searchQuery,
  onSearchChange,
}: HeroSectionProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-10 dark:from-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-5xl font-extrabold text-blue-700 dark:text-blue-400">
          MyDebugger
        </h1>
        <p className="mb-6 mt-3 text-lg text-gray-700 dark:text-gray-300">
          A modern, open-source toolbox for web & mobile developers
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Search tools..."
            className="flex-grow rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:text-white"
            aria-label="search tools"
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}

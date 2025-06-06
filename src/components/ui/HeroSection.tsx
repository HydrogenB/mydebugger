"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { ChangeEvent, FormEvent } from "react";
import { Textbox, Button } from "@/view/ui";

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
          <Textbox
            value={searchQuery}
            onChange={handleChange}
            placeholder="Search tools..."
            aria-label="search tools"
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
    </section>
  );
}

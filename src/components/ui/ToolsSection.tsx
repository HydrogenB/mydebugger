"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import ToolCard from "./ToolCard";
import { Tool } from "@/models";

interface ToolsSectionProps {
  tools: Tool[];
}

export default function ToolsSection({ tools }: ToolsSectionProps) {
  return (
    <section id="tools" className="py-6">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-semibold">Available Tools</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}

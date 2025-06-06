"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { ToolsCard } from "@/view/ui";
import { Tool } from "@/models";

interface ToolsSectionProps {
  tools: Tool[];
}

export default function ToolsSection({ tools }: ToolsSectionProps) {
  return (
    <section id="tools" className="py-6">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-semibold">Available Tools</h2>
        {tools.length === 0 ? (
          <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
            No tools found.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {tools.map((tool) => (
              <ToolsCard
                key={tool.id}
                icon={tool.icon}
                title={tool.name}
                description={tool.description}
                href={tool.route}
                tags={[
                  ...(tool.isNew ? ['New'] : []),
                  ...(tool.isPopular ? ['Popular'] : []),
                ]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

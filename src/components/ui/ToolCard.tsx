"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import Link from "next/link";
import { Tool } from "@/models";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="flex h-full flex-col rounded-md border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          {tool.icon && (
            <span aria-hidden className="text-2xl">
              {tool.icon}
            </span>
          )}
          <h3 className="text-lg font-semibold">{tool.name}</h3>
          {tool.isNew && (
            <span className="rounded bg-green-600 px-1.5 py-0.5 text-xs text-white">
              New
            </span>
          )}
          {tool.isPopular && (
            <span className="rounded bg-purple-600 px-1.5 py-0.5 text-xs text-white">
              Popular
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {tool.description}
        </p>
      </div>
      <div className="mt-4">
        <Link
          href={tool.route}
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 focus:outline-none focus:ring"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

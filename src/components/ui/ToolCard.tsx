'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import Link from 'next/link';
import { Tool } from '@/models';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="flex h-full flex-col rounded-md border border-gray-300 p-4">
      <div className="flex-grow">
        <h3 className="mb-2 text-lg font-semibold">{tool.name}</h3>
        <p className="text-sm text-gray-600">{tool.description}</p>
      </div>
      <div className="mt-4">
        <Link
          href={tool.route}
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

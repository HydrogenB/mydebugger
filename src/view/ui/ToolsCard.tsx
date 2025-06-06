"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";

interface ToolsCardProps {
  icon?: string;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  tags?: string[];
}

export default function ToolsCard({
  icon,
  title,
  description,
  footer,
  actions,
  href,
  onClick,
  loading = false,
  disabled = false,
  tags = [],
}: ToolsCardProps) {

  const content = (
    <div
      className={clsx(
        "flex flex-col rounded-md border p-4 transition-shadow",
        disabled ? "opacity-50" : "hover:shadow-md",
        href || onClick ? "cursor-pointer" : "",
        "hc:border-black hc:bg-white"
      )}
      aria-disabled={disabled}
    >
      <div className="flex items-start gap-2">
        {icon && <span className="text-2xl hc:text-black" aria-hidden>{icon}</span>}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold truncate">
            {loading && !title ? (
              <span className="inline-block w-24 animate-pulse bg-gray-200">\u00A0</span>
            ) : (
              title
            )}
          </h3>
          {tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-gray-200 px-1.5 text-xs dark:bg-gray-700 hc:bg-black hc:text-white"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {loading && !description ? (
              <span className="inline-block h-4 w-full animate-pulse bg-gray-200" />
            ) : (
              description
            )}
          </p>
        </div>
      </div>
      {actions && <div className="mt-3 flex gap-2 hc:text-black">{actions}</div>}
      {footer && <div className="mt-3 text-sm text-gray-500 hc:text-black">{footer}</div>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

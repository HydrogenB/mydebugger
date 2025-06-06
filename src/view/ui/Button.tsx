"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded font-medium focus:outline-none focus:ring transition-colors";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-500 hc:bg-black hc:text-white",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white hc:bg-black hc:text-white",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hc:bg-black hc:text-white",
    danger:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 hc:bg-black hc:text-white",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-1.5 text-base",
    lg: "px-4 py-2 text-lg",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <span className="animate-spin">⏳</span> : children}
    </button>
  );
}

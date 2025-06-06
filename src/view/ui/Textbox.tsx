"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { InputHTMLAttributes, ReactNode, useState } from "react";
import clsx from "clsx";

interface TextboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: ReactNode;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  showCounter?: boolean;
}

export default function Textbox({
  label,
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  type = "text",
  fullWidth = true,
  showCounter = false,
  className,
  ...rest
}: TextboxProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const length = typeof rest.value === "string" ? rest.value.length : 0;

  return (
    <label className={clsx("block", fullWidth && "w-full")}>
      {label && <span className="mb-1 block font-medium">{label}</span>}
      <div className="relative flex items-center">
        {leadingIcon && <span className="absolute left-2">{leadingIcon}</span>}
        <input
          {...rest}
          type={inputType}
          className={clsx(
            "rounded border px-3 py-1 w-full focus:ring",
            leadingIcon && "pl-8",
            trailingIcon && !isPassword && "pr-8",
            className,
            error && "border-red-500",
            (rest.disabled || rest.readOnly) && "opacity-50",
            "hc:border-black hc:bg-white hc:text-black"
          )}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-2 text-sm"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        )}
        {trailingIcon && !isPassword && <span className="absolute right-2">{trailingIcon}</span>}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500 hc:text-black">{helperText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600 hc:text-black">{error}</p>}
      {showCounter && (
        <p className="mt-1 text-right text-xs text-gray-400">{length}</p>
      )}
    </label>
  );
}

"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";
import {
  getButtonClasses,
  ButtonVariant,
  ButtonSize,
} from "./Button";

interface LinkButtonProps extends LinkProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export default function LinkButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: LinkButtonProps) {
  return (
    <Link {...rest} className={clsx(getButtonClasses(variant, size), className)}>
      {children}
    </Link>
  );
}

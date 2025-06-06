"use client";

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { ReactNode } from "react";
import Head from "next/head";

interface PageProps {
  title?: string;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  background?: string;
}

export default function Page({
  title,
  header,
  footer,
  children,
  className,
  background,
}: PageProps) {
  return (
    <div className={background ?? "min-h-screen flex flex-col bg-white dark:bg-gray-900 hc:bg-white"}>
      {title && (
        <Head>
          <title>{title}</title>
        </Head>
      )}
      {header}
      <main className={"flex-grow px-4 py-4 " + (className ?? "")}>{children}</main>
      {footer}
    </div>
  );
}

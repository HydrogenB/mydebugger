'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-200 py-3 px-2 dark:bg-gray-700">
      <div className="mx-auto max-w-6xl text-center text-sm text-gray-600 dark:text-gray-300">
        © {new Date().getFullYear()}{' '}
        <Link href="/" className="hover:underline">
          MyDebugger
        </Link>{' '}
        - A stateless debugging toolkit for developers
      </div>
    </footer>
  );
}

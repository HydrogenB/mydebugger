'use client';

import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl py-8 text-center">
        <div className="mb-4 text-6xl">😕</div>
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <h2 className="mb-2 text-2xl">Page Not Found</h2>
        <p className="mb-4 text-gray-600">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Go to Homepage
          </Link>
          <Link href="/modules" className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
            Browse Tools
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}

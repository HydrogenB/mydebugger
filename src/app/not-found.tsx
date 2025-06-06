'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import { Button } from '@/view/ui';

export default function NotFound() {
  const router = useRouter();
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
          <Button onClick={() => router.push('/')}>Go to Homepage</Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/modules')}
          >
            Browse Tools
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}

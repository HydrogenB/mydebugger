'use client';

import MainLayout from '@/components/layout/MainLayout';
import { LinkButton } from '@/view/ui';

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
          <LinkButton href="/">Go to Homepage</LinkButton>
          <LinkButton href="/modules" variant="secondary">
            Browse Tools
          </LinkButton>
        </div>
      </div>
    </MainLayout>
  );
}

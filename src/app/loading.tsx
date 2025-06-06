'use client';

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <p className="mt-3 text-lg">Loading...</p>
    </div>
  );
}

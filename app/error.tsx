'use client';

import { Button } from '@/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-[64px] mb-4">⚠️</div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-3">Something went wrong</h1>
      <p className="text-text-muted text-sm leading-relaxed max-w-sm mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

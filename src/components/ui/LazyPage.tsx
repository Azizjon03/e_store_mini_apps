import { Suspense, type ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';

export function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Spinner className="py-20" />}>
      <div className="page-enter">
        {children}
      </div>
    </Suspense>
  );
}

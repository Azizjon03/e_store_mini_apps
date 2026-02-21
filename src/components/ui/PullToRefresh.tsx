import type { ReactNode } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Spinner } from './Spinner';

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { indicatorRef } = usePullToRefresh({ onRefresh });

  return (
    <div className="relative">
      <div
        ref={indicatorRef}
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{ opacity: 0, transform: 'translateY(0)', zIndex: 10 }}
      >
        <Spinner className="py-2" />
      </div>
      {children}
    </div>
  );
}

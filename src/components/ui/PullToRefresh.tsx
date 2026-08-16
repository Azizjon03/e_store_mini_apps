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
      {/*
        `pointer-events-none` is load-bearing, not cosmetic. The indicator is a
        full-width absolutely positioned strip pinned over the top of the page,
        so at rest (opacity 0) it still sat on top of the first row of
        CategoryChips on Home and swallowed every tap on it —
        `elementFromPoint()` returned this div, not the tile. The pull gesture
        is unaffected: `usePullToRefresh` binds touchstart/move/end to
        `document`, never to this element, so it never needs to receive events.
      */}
      <div
        ref={indicatorRef}
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 pointer-events-none"
        style={{ opacity: 0, transform: 'translateY(0)', zIndex: 10 }}
      >
        <Spinner className="py-2" />
      </div>
      {children}
    </div>
  );
}

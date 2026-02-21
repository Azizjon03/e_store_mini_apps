import { useRef, useCallback, useEffect } from 'react';
import { useHaptic } from './useHaptic';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<unknown>;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) {
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const pulling = useRef(false);
  const refreshing = useRef(false);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const haptic = useHaptic();
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && !refreshing.current) {
      startY.current = e.touches[0].clientY;
      pullDistance.current = 0;
      pulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pulling.current || refreshing.current) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0 && indicatorRef.current) {
        pullDistance.current = diff;
        indicatorRef.current.style.transform = `translateY(${Math.min(diff * 0.5, threshold)}px)`;
        indicatorRef.current.style.opacity = `${Math.min(diff / threshold, 1)}`;
      }
    },
    [threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current || refreshing.current) return;
    pulling.current = false;

    const shouldRefresh = pullDistance.current >= threshold;

    if (indicatorRef.current) {
      indicatorRef.current.style.transform = 'translateY(0)';
      indicatorRef.current.style.opacity = '0';
    }

    if (shouldRefresh) {
      refreshing.current = true;
      haptic.impact('light');
      try {
        await onRefreshRef.current();
      } finally {
        refreshing.current = false;
      }
    }
  }, [threshold, haptic]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { indicatorRef };
}

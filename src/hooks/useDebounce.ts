import { useEffect, useState } from 'react';

/**
 * Returns a copy of `value` that only updates after `delay` ms have passed
 * without `value` changing. Same 300ms idiom Search.tsx used inline for its
 * query input; extracted here so Catalog.tsx's price filter can reuse it
 * instead of firing a request per keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

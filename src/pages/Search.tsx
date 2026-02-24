import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, getPopularSearches } from '@/api/storefront';
import { useAppStore } from '@/store/appStore';
import { useHaptic } from '@/hooks/useHaptic';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
export default function Search() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const haptic = useHaptic();

  const searchHistory = useAppStore((s) => s.searchHistory);
  const addSearchHistory = useAppStore((s) => s.addSearchHistory);
  const removeSearchHistory = useAppStore((s) => s.removeSearchHistory);

  // Autofocus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search results
  const { data: results, isLoading: isSearching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Popular searches
  const { data: popularSearches } = useQuery({
    queryKey: ['popular-searches'],
    queryFn: getPopularSearches,
  });

  // Save to history on search
  useEffect(() => {
    if (debouncedQuery.length >= 2 && results && results.data.length > 0) {
      addSearchHistory(debouncedQuery);
    }
  }, [debouncedQuery, results, addSearchHistory]);

  const handlePopularClick = useCallback(
    (term: string) => {
      haptic.selectionChanged();
      setQuery(term);
    },
    [haptic],
  );

  const handleHistoryClick = useCallback(
    (term: string) => {
      haptic.selectionChanged();
      setQuery(term);
    },
    [haptic],
  );

  const showEmptyState = debouncedQuery.length < 2;
  const showResults = debouncedQuery.length >= 2;
  const products = results?.data ?? [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      {/* Search Input */}
      <div className="sticky top-0 z-30 px-4 py-2" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div
          className="flex items-center gap-2 h-10 px-3 rounded-[10px]"
          style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path
              d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5"
              stroke="var(--tg-theme-hint-color, #999)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidirish..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--tg-theme-text-color)' }}
          />
          {query && (
            <button
              className="text-lg leading-none"
              style={{ color: 'var(--tg-theme-hint-color)' }}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Empty state: history + popular */}
      {showEmptyState && (
        <div className="px-4 py-4">
          {/* Recent searches */}
          {searchHistory.length > 0 && (
            <div className="mb-6">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                So'nggi qidiruvlar
              </h3>
              <div className="flex flex-col">
                {searchHistory.map((term) => (
                  <div
                    key={term}
                    className="flex items-center justify-between py-2.5"
                  >
                    <button
                      className="flex items-center gap-2 text-sm"
                      style={{ color: 'var(--tg-theme-text-color)' }}
                      onClick={() => handleHistoryClick(term)}
                    >
                      <span style={{ color: 'var(--tg-theme-hint-color)' }}>🕐</span>
                      {term}
                    </button>
                    <button
                      className="text-sm px-1"
                      style={{ color: 'var(--tg-theme-hint-color)' }}
                      onClick={() => removeSearchHistory(term)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          {popularSearches && popularSearches.length > 0 && (
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                Mashxur qidiruvlar
              </h3>
              <div className="flex gap-2 flex-wrap">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    className="px-3 py-1.5 rounded-[20px] text-sm"
                    style={{
                      backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                      color: 'var(--tg-theme-text-color)',
                    }}
                    onClick={() => handlePopularClick(term)}
                  >
                    🔥 {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search results */}
      {showResults && (
        <div className="px-4">
          {isSearching ? (
            <div className="grid grid-cols-2 gap-2 py-4">
              {Array.from({ length: 4 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <p
                className="text-sm py-2"
                style={{ color: 'var(--tg-theme-hint-color)' }}
              >
                Natijalar ({results?.meta.total ?? products.length})
              </p>
              <div className="grid grid-cols-2 gap-2 pb-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon="😔"
              title={`"${debouncedQuery}" bo'yicha hech narsa topilmadi`}
              description="Yozuvni tekshiring yoki boshqa kalit so'z ishlating"
            />
          )}
        </div>
      )}
    </div>
  );
}

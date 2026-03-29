import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, getPopularSearches, getSearchSuggestions } from '@/api/storefront';
import { useAppStore } from '@/store/appStore';
import { useHaptic } from '@/hooks/useHaptic';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const haptic = useHaptic();

  const searchHistory = useAppStore((s) => s.searchHistory);
  const addSearchHistory = useAppStore((s) => s.addSearchHistory);
  const removeSearchHistory = useAppStore((s) => s.removeSearchHistory);
  const clearSearchHistory = useAppStore((s) => s.clearSearchHistory);

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

  // Autocomplete suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && debouncedQuery.length <= 30,
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
      {/* Search bar with back arrow and cancel */}
      <div
        className="sticky top-0 z-30 px-4 py-2 flex items-center gap-2"
        style={{ backgroundColor: 'var(--tg-theme-bg-color)', borderBottom: '1px solid var(--storex-border)' }}
      >
        <button
          className="shrink-0 w-8 h-8 flex items-center justify-center press-effect"
          onClick={() => navigate(-1)}
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          className="flex-1 flex items-center gap-2 h-9 px-3"
          style={{
            borderRadius: 'var(--storex-radius-sm)',
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path
              d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5"
              stroke="var(--tg-theme-hint-color)"
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
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: 'var(--tg-theme-text-color)' }}
          />
          {query && (
            <button
              className="shrink-0"
              style={{ color: 'var(--tg-theme-hint-color)' }}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" fill="currentColor" opacity="0.15" />
                <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        {query ? (
          <button
            className="shrink-0 text-[15px] font-medium press-effect"
            style={{ color: 'var(--storex-primary)' }}
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            Bekor
          </button>
        ) : null}
      </div>

      {/* Empty state: history + popular */}
      {showEmptyState && (
        <div className="px-4 py-4">
          {/* Recent searches */}
          {searchHistory.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[15px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                  So'nggi qidiruvlar
                </span>
                <button
                  className="text-[13px] font-medium press-effect"
                  style={{ color: 'var(--storex-danger)' }}
                  onClick={() => {
                    clearSearchHistory();
                    haptic.selectionChanged();
                  }}
                >
                  Tozalash
                </button>
              </div>
              <div className="flex flex-col">
                {searchHistory.map((term) => (
                  <div
                    key={term}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: '1px solid var(--storex-border)' }}
                  >
                    <button
                      className="flex items-center gap-3 text-[15px] press-effect"
                      style={{ color: 'var(--tg-theme-text-color)' }}
                      onClick={() => handleHistoryClick(term)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--tg-theme-hint-color)' }}>
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      {term}
                    </button>
                    <button
                      className="p-1 press-effect"
                      style={{ color: 'var(--tg-theme-hint-color)' }}
                      onClick={() => removeSearchHistory(term)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          {popularSearches && popularSearches.length > 0 && (
            <div>
              <p
                className="text-[15px] font-semibold mb-3"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                Mashxur qidiruvlar
              </p>
              <div className="flex gap-2 flex-wrap">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    className="storex-chip press-effect"
                    style={{
                      backgroundColor: 'var(--storex-primary-light)',
                      borderColor: 'transparent',
                      color: 'var(--storex-primary)',
                    }}
                    onClick={() => handlePopularClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Autocomplete suggestions */}
      {showResults && suggestions && suggestions.length > 0 && (isSearching || products.length === 0) && (
        <div className="px-4 py-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="flex items-center gap-3 w-full py-2.5 press-effect"
              style={{ borderBottom: '1px solid var(--storex-border)' }}
              onClick={() => {
                haptic.selectionChanged();
                setQuery(suggestion);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--tg-theme-hint-color)' }}>
                <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[15px]" style={{ color: 'var(--tg-theme-text-color)' }}>
                {suggestion}
              </span>
            </button>
          ))}
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
                className="text-[13px] py-3"
                style={{ color: 'var(--tg-theme-hint-color)' }}
              >
                {results?.meta.total ?? products.length} ta natija
              </p>
              <div className="grid grid-cols-2 gap-2 pb-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4" style={{ color: 'var(--tg-theme-hint-color)' }}>
                <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5" />
                <path d="M30 30l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M14 20h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-[17px] font-semibold mb-1" style={{ color: 'var(--tg-theme-text-color)' }}>
                Hech narsa topilmadi
              </p>
              <p className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
                "{debouncedQuery}" bo'yicha natija yo'q. Boshqa so'z bilan qidirib ko'ring.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

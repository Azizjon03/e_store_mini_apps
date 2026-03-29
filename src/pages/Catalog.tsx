import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getProductFilters } from '@/api/storefront';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useHaptic } from '@/hooks/useHaptic';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ProductFilters } from '@/api/types';
import { t } from '@/lib/format';

type SortOption = ProductFilters['sort'];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Ommabop' },
  { value: 'price_asc', label: 'Arzon → Qimmat' },
  { value: 'price_desc', label: 'Qimmat → Arzon' },
  { value: 'newest', label: 'Yangi' },
  { value: 'rating', label: 'Reyting' },
];

export default function Catalog() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const haptic = useHaptic();
  const loaderRef = useRef<HTMLDivElement>(null);

  const [userCategory, setUserCategory] = useState<string | undefined>(undefined);
  const activeCategory = userCategory ?? categorySlug;
  const setActiveCategory = setUserCategory;
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'popular',
  );
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(
    searchParams.get('discount_only') === 'true',
  );
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();

  const filters: Omit<ProductFilters, 'page'> = useMemo(
    () => ({
      category_slug: activeCategory,
      sort,
      discount_only: discountOnly || undefined,
      min_price: minPrice,
      max_price: maxPrice,
      rating: minRating,
      per_page: 20,
    }),
    [activeCategory, sort, discountOnly, minPrice, maxPrice, minRating],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProducts(filters);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: filterOptions } = useQuery({
    queryKey: ['product-filters', activeCategory],
    queryFn: () => getProductFilters({ category_slug: activeCategory }),
  });

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((p) => p.data) ?? [];

  const activeFilterCount =
    (discountOnly ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (minRating ? 1 : 0);

  const clearFilters = useCallback(() => {
    setDiscountOnly(false);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
  }, []);

  return (
    <PageLayout>
      {/* Category filter chips */}
      {categories && categories.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              className="storex-chip"
              style={!activeCategory ? {
                backgroundColor: 'var(--storex-primary)',
                borderColor: 'var(--storex-primary)',
                color: '#fff',
              } : undefined}
              onClick={() => {
                haptic.selectionChanged();
                setActiveCategory(undefined);
              }}
            >
              Hammasi
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="storex-chip"
                style={activeCategory === cat.slug ? {
                  backgroundColor: 'var(--storex-primary)',
                  borderColor: 'var(--storex-primary)',
                  color: '#fff',
                } : undefined}
                onClick={() => {
                  haptic.selectionChanged();
                  setActiveCategory(cat.slug);
                }}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {t(cat.name)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort + Filter row */}
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium press-effect"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            borderRadius: 'var(--storex-radius-full)',
            color: 'var(--tg-theme-text-color)',
          }}
          onClick={() => setShowSort(true)}
        >
          Saralash: {SORT_OPTIONS.find((s) => s.value === sort)?.label}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium press-effect relative"
          style={{
            backgroundColor: activeFilterCount > 0 ? 'var(--storex-primary)' : 'var(--tg-theme-secondary-bg-color)',
            borderRadius: 'var(--storex-radius-full)',
            color: activeFilterCount > 0 ? '#fff' : 'var(--tg-theme-text-color)',
          }}
          onClick={() => setShowFilter(true)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filter
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold">({activeFilterCount})</span>
          )}
        </button>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 px-4">
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : allProducts.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Mahsulotlar topilmadi"
          description="Boshqa filter yoki kategoriya tanlang"
          action={{
            label: 'Filtrlarni tozalash',
            onClick: () => {
              clearFilters();
              setActiveCategory(undefined);
            },
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 px-4">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div ref={loaderRef} className="py-4">
            {isFetchingNextPage && (
              <div className="grid grid-cols-2 gap-2 px-4">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </div>
            )}
            {!hasNextPage && allProducts.length > 0 && (
              <p
                className="text-center text-sm py-4"
                style={{ color: 'var(--tg-theme-hint-color)' }}
              >
                Boshqa mahsulot yo'q
              </p>
            )}
          </div>
        </>
      )}

      {/* Sort Bottom Sheet */}
      <BottomSheet isOpen={showSort} onClose={() => setShowSort(false)} title="Saralash">
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="flex items-center justify-between px-3 py-3 text-sm text-left press-effect"
              style={{
                backgroundColor: sort === opt.value ? 'var(--storex-primary-light)' : 'transparent',
                color: sort === opt.value ? 'var(--storex-primary)' : 'var(--tg-theme-text-color)',
                borderRadius: 'var(--storex-radius-sm)',
                fontWeight: sort === opt.value ? 600 : 400,
              }}
              onClick={() => {
                haptic.selectionChanged();
                setSort(opt.value);
                setShowSort(false);
              }}
            >
              <span>{opt.label}</span>
              {sort === opt.value && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--storex-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Filter Bottom Sheet */}
      <BottomSheet isOpen={showFilter} onClose={() => setShowFilter(false)} title="Filtr">
        <div className="flex flex-col gap-5 pb-4">
          {/* Price range */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Narx oralig'i
            </h4>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder={filterOptions?.price_range ? String(filterOptions.price_range.min) : 'dan'}
                value={minPrice ?? ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 h-11 px-3.5 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                  borderRadius: 'var(--storex-radius-md)',
                }}
              />
              <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>—</span>
              <input
                type="number"
                placeholder={filterOptions?.price_range ? String(filterOptions.price_range.max) : 'gacha'}
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 h-11 px-3.5 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                  borderRadius: 'var(--storex-radius-md)',
                }}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Reyting
            </h4>
            <div className="flex flex-col gap-1">
              {[5, 4, 3].map((r) => (
                <button
                  key={r}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm press-effect"
                  style={{
                    backgroundColor: minRating === r ? 'var(--storex-primary-light)' : 'transparent',
                    color: minRating === r ? 'var(--storex-primary)' : 'var(--tg-theme-text-color)',
                    borderRadius: 'var(--storex-radius-sm)',
                  }}
                  onClick={() => setMinRating(minRating === r ? undefined : r)}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 12 12" fill={i < r ? '#f59e0b' : 'var(--tg-theme-secondary-bg-color)'}>
                        <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.93L6 8.89 2.48 10.85l.67-3.93L.3 4.14l3.94-.57z" />
                      </svg>
                    ))}
                  </div>
                  {r < 5 && <span className="text-xs">va yuqori</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Discount only toggle */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
              Faqat chegirmali
            </span>
            <button
              className="w-12 h-7 rounded-full p-0.5 transition-colors duration-200"
              style={{
                backgroundColor: discountOnly ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color, #ccc)',
              }}
              onClick={() => setDiscountOnly(!discountOnly)}
            >
              <div
                className="w-6 h-6 rounded-full bg-white transition-transform duration-200"
                style={{
                  transform: discountOnly ? 'translateX(20px)' : 'translateX(0)',
                  boxShadow: 'var(--storex-shadow-sm)',
                }}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 py-3 text-sm font-semibold press-effect"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                color: 'var(--tg-theme-text-color)',
                borderRadius: 'var(--storex-radius-md)',
              }}
              onClick={() => clearFilters()}
            >
              Tozalash
            </button>
            <button
              className="flex-1 py-3 text-sm font-semibold press-effect"
              style={{
                backgroundColor: 'var(--storex-primary)',
                color: '#fff',
                borderRadius: 'var(--storex-radius-md)',
              }}
              onClick={() => {
                haptic.impact('light');
                setShowFilter(false);
              }}
            >
              Ko'rsatish
            </button>
          </div>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}

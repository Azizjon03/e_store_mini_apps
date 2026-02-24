import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/storefront';
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
  { value: 'popular', label: 'Mashxur' },
  { value: 'price_asc', label: 'Narx: arzon → qimmat' },
  { value: 'price_desc', label: 'Narx: qimmat → arzon' },
  { value: 'newest', label: 'Yangi' },
  { value: 'rating', label: 'Reyting bo\'yicha' },
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

  // Infinite scroll via IntersectionObserver
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
      {/* Category chips */}
      {categories && categories.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              className="px-3.5 py-1.5 rounded-[20px] text-sm shrink-0 font-medium transition-all"
              style={{
                backgroundColor: !activeCategory
                  ? 'var(--tg-theme-button-color)'
                  : 'var(--tg-theme-secondary-bg-color)',
                color: !activeCategory
                  ? 'var(--tg-theme-button-text-color)'
                  : 'var(--tg-theme-text-color)',
              }}
              onClick={() => {
                haptic.selectionChanged();
                setActiveCategory(undefined);
              }}
            >
              Barchasi
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[20px] text-sm shrink-0 font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor:
                    activeCategory === cat.slug
                      ? 'var(--tg-theme-button-color)'
                      : 'var(--tg-theme-secondary-bg-color)',
                  color:
                    activeCategory === cat.slug
                      ? 'var(--tg-theme-button-text-color)'
                      : 'var(--tg-theme-text-color)',
                }}
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

      {/* Sort + Filter bar */}
      <div className="flex gap-2 px-4 py-2">
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-sm"
          style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
          onClick={() => setShowSort(true)}
        >
          <span>⬇️</span>
          {SORT_OPTIONS.find((s) => s.value === sort)?.label ?? 'Saralash'}
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-sm relative"
          style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
          onClick={() => setShowFilter(true)}
        >
          <span>🔽</span>
          Filter
          {activeFilterCount > 0 && (
            <span
              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              {activeFilterCount}
            </span>
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

          {/* Infinite scroll loader */}
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
              className="flex items-center justify-between px-3 py-3 rounded-[8px] text-sm text-left"
              style={{
                backgroundColor: sort === opt.value ? 'var(--tg-theme-secondary-bg-color)' : 'transparent',
                color: 'var(--tg-theme-text-color)',
              }}
              onClick={() => {
                haptic.selectionChanged();
                setSort(opt.value);
                setShowSort(false);
              }}
            >
              <span>{opt.label}</span>
              {sort === opt.value && (
                <span style={{ color: 'var(--tg-theme-button-color)' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filterlash"
      >
        <div className="flex flex-col gap-5 pb-4">
          {/* Price range */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Narx oralig'i
            </h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ''}
                onChange={(e) =>
                  setMinPrice(e.target.value ? Number(e.target.value) : undefined)
                }
                className="flex-1 h-10 px-3 rounded-[8px] text-sm outline-none"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                }}
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ''}
                onChange={(e) =>
                  setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
                }
                className="flex-1 h-10 px-3 rounded-[8px] text-sm outline-none"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                }}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Reyting
            </h4>
            <div className="flex flex-col gap-2">
              {[5, 4, 3].map((r) => (
                <button
                  key={r}
                  className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm"
                  style={{
                    backgroundColor:
                      minRating === r
                        ? 'var(--tg-theme-secondary-bg-color)'
                        : 'transparent',
                    color: 'var(--tg-theme-text-color)',
                  }}
                  onClick={() => setMinRating(minRating === r ? undefined : r)}
                >
                  <span>{r === 5 ? '⭐'.repeat(5) : '⭐'.repeat(r) + ' va yuqori'}</span>
                  {minRating === r && (
                    <span style={{ color: 'var(--tg-theme-button-color)' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Discount only */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--tg-theme-text-color)' }}>
              Faqat chegirmali
            </span>
            <button
              className="w-12 h-7 rounded-full p-0.5 transition-colors duration-200"
              style={{
                backgroundColor: discountOnly
                  ? 'var(--tg-theme-button-color)'
                  : 'var(--tg-theme-hint-color, #ccc)',
              }}
              onClick={() => setDiscountOnly(!discountOnly)}
            >
              <div
                className="w-6 h-6 rounded-full transition-transform duration-200"
                style={{
                  backgroundColor: '#fff',
                  transform: discountOnly ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 py-3 rounded-[12px] text-sm font-medium"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                color: 'var(--tg-theme-text-color)',
              }}
              onClick={() => {
                clearFilters();
              }}
            >
              Tozalash
            </button>
            <button
              className="flex-1 py-3 rounded-[12px] text-sm font-medium"
              style={{
                backgroundColor: 'var(--tg-theme-button-color)',
                color: 'var(--tg-theme-button-text-color)',
              }}
              onClick={() => {
                haptic.impact('light');
                setShowFilter(false);
              }}
            >
              ✓ Qo'llash
            </button>
          </div>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}

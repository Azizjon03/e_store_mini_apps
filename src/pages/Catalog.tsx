import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getProductFilters } from '@/api/storefront';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useHaptic } from '@/hooks/useHaptic';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProductGrid } from '@/components/product/ProductGrid';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Chip';
import { FilterSheet } from '@/components/catalog/FilterSheet';
import {
  EMPTY_CATALOG_FILTERS,
  getAppliedFilterCount,
  toProductFilterParams,
  type CatalogFilterValues,
} from '@/lib/catalogFilters';
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
  const [appliedFilters, setAppliedFilters] = useState<CatalogFilterValues>(
    () => ({
      ...EMPTY_CATALOG_FILTERS,
      discountOnly: searchParams.get('discount_only') === 'true',
    }),
  );

  const filters: Omit<ProductFilters, 'page'> = useMemo(
    () => ({
      category_slug: activeCategory,
      sort,
      per_page: 20,
      ...toProductFilterParams(appliedFilters),
    }),
    [activeCategory, sort, appliedFilters],
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

  // Category counts come from `/products/filters` (`FilterOptions.categories`),
  // matched onto the category chips built from `/categories` by slug.
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    filterOptions?.categories?.forEach((c) => map.set(c.slug, c.count));
    return map;
  }, [filterOptions]);

  // Prefer the server's own count of applied filters when the response
  // carries it; fall back to counting the client's own filter state.
  const activeFilterCount = getAppliedFilterCount(data?.pages[0]?.meta, appliedFilters);

  const clearAllFilters = useCallback(() => {
    setAppliedFilters(EMPTY_CATALOG_FILTERS);
    setActiveCategory(undefined);
  }, [setActiveCategory]);

  return (
    <PageLayout>
      {/* Category filter chips */}
      {categories && categories.length > 0 && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Chip
              active={!activeCategory}
              onClick={() => {
                haptic.selectionChanged();
                setActiveCategory(undefined);
              }}
            >
              Hammasi
            </Chip>
            {categories.map((cat) => {
              const count = categoryCounts.get(cat.slug);
              return (
                <Chip
                  key={cat.id}
                  active={activeCategory === cat.slug}
                  onClick={() => {
                    haptic.selectionChanged();
                    setActiveCategory(cat.slug);
                  }}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {t(cat.name)}
                  {typeof count === 'number' && ` (${count})`}
                </Chip>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort + Filter row */}
      <div className="flex items-center gap-2 px-4 py-3">
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
          Filtr
          {activeFilterCount > 0 && (
            <>
              {' '}
              <span className="text-[10px] font-bold">({activeFilterCount})</span>
            </>
          )}
        </button>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <ProductGrid products={[]} isLoading skeletonCount={6} />
      ) : allProducts.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Mahsulotlar topilmadi"
          description="Boshqa filtr yoki kategoriya tanlang"
          action={{
            label: 'Filtrlarni tozalash',
            onClick: clearAllFilters,
          }}
        />
      ) : (
        <>
          <ProductGrid products={allProducts} />

          <div ref={loaderRef} className="py-4">
            {isFetchingNextPage && <ProductGrid products={[]} isLoading skeletonCount={2} />}
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
      <FilterSheet
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filterOptions={filterOptions}
        categorySlug={activeCategory}
        applied={appliedFilters}
        onApply={setAppliedFilters}
      />
    </PageLayout>
  );
}

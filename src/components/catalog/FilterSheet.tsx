import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProducts } from '@/api/storefront';
import type { FilterOptions } from '@/api/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useHaptic } from '@/hooks/useHaptic';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Chip } from '@/components/ui/Chip';
import {
  RATING_OPTIONS,
  toProductFilterParams,
  type CatalogFilterValues,
} from '@/lib/catalogFilters';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions?: FilterOptions;
  categorySlug?: string;
  /** Currently applied values — used only to seed the draft when the sheet mounts. */
  applied: CatalogFilterValues;
  onApply: (values: CatalogFilterValues) => void;
}

/**
 * Filter bottom sheet for Catalog. `BottomSheet` unmounts its children
 * entirely while closed (`isOpen` false returns `null`), so `FilterSheetBody`
 * remounting fresh on every open — reseeding its draft state from `applied`
 * via a plain `useState` initializer — is what resets the draft each time,
 * with no effect required to sync it.
 */
export function FilterSheet({ isOpen, onClose, filterOptions, categorySlug, applied, onApply }: FilterSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filtr">
      <FilterSheetBody
        filterOptions={filterOptions}
        categorySlug={categorySlug}
        initial={applied}
        onApply={(values) => {
          onApply(values);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

function FilterSheetBody({
  filterOptions,
  categorySlug,
  initial,
  onApply,
}: {
  filterOptions?: FilterOptions;
  categorySlug?: string;
  initial: CatalogFilterValues;
  onApply: (values: CatalogFilterValues) => void;
}) {
  const haptic = useHaptic();

  const [minPrice, setMinPrice] = useState<number | undefined>(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initial.maxPrice);
  const [minRating, setMinRating] = useState<number | undefined>(initial.minRating);
  const [discountOnly, setDiscountOnly] = useState(initial.discountOnly);
  const [brands, setBrands] = useState<number[]>(initial.brands);
  const [attributes, setAttributes] = useState<Record<string, string[]>>(initial.attributes);

  // Same 300ms debounce idiom as the price inputs elsewhere — only the price
  // typing needs it, brand/rating/attribute picks are discrete taps.
  const debouncedMinPrice = useDebounce(minPrice, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  const previewParams = useMemo(
    () => ({
      category_slug: categorySlug,
      per_page: 1,
      page: 1,
      ...toProductFilterParams({
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
        minRating,
        discountOnly,
        brands,
        attributes,
      }),
    }),
    [categorySlug, debouncedMinPrice, debouncedMaxPrice, minRating, discountOnly, brands, attributes],
  );

  // Live "N ta natijani ko'rish" count — a lightweight query (per_page: 1,
  // only `meta.total` is read) driven by the *draft* selections, so a
  // shopper never confirms a combination that turns out to return nothing.
  const { data: preview } = useQuery({
    queryKey: ['products-count', previewParams],
    queryFn: () => getProducts(previewParams),
    placeholderData: keepPreviousData,
  });
  const previewTotal = preview?.meta.total;

  const toggleBrand = (id: number) => {
    haptic.selectionChanged();
    setBrands((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  const toggleAttribute = (name: string, value: string) => {
    haptic.selectionChanged();
    setAttributes((prev) => {
      const current = prev[name] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length === 0) {
        const rest = { ...prev };
        delete rest[name];
        return rest;
      }
      return { ...prev, [name]: next };
    });
  };

  const handleClear = () => {
    haptic.impact('light');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setDiscountOnly(false);
    setBrands([]);
    setAttributes({});
  };

  const handleApply = () => {
    haptic.impact('light');
    onApply({ minPrice, maxPrice, minRating, discountOnly, brands, attributes });
  };

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Scrollable filter groups — capped so the action row below always
          stays reachable without the whole sheet needing to scroll. */}
      <div className="flex flex-col gap-5 max-h-[46vh] overflow-y-auto pr-1">
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
            {RATING_OPTIONS.map((r) => (
              <button
                key={r}
                className="flex items-center gap-2 px-3 py-4 text-sm press-effect"
                style={{
                  backgroundColor: minRating === r ? 'var(--storex-primary-light)' : 'transparent',
                  color: minRating === r ? 'var(--storex-primary)' : 'var(--tg-theme-text-color)',
                  borderRadius: 'var(--storex-radius-sm)',
                }}
                onClick={() => setMinRating(minRating === r ? undefined : r)}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      width="14"
                      height="14"
                      viewBox="0 0 12 12"
                      fill={i < r ? 'var(--storex-warning)' : 'var(--tg-theme-secondary-bg-color)'}
                    >
                      <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.93L6 8.89 2.48 10.85l.67-3.93L.3 4.14l3.94-.57z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs">va yuqori</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brands */}
        {filterOptions?.brands && filterOptions.brands.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Brend
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.brands.map((brand) => (
                <Chip key={brand.id} active={brands.includes(brand.id)} onClick={() => toggleBrand(brand.id)}>
                  {brand.name} ({brand.count})
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Attributes — one group per entry, values OR'd within a group */}
        {filterOptions?.attributes?.map((group) => (
          <div key={group.name}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              {group.name}
            </h4>
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => (
                <Chip
                  key={value}
                  active={(attributes[group.name] ?? []).includes(value)}
                  onClick={() => toggleAttribute(group.name, value)}
                >
                  {value}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Discount only toggle — always visible, not part of the scroll area */}
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

      {/* Actions — pinned to the bottom of the sheet's own scroll container
          so the confirm button stays reachable regardless of how tall the
          filter groups above get. */}
      <div
        className="flex gap-3 pt-4 sticky bottom-0"
        style={{ backgroundColor: 'var(--tg-theme-bg-color)', borderTop: 'var(--storex-border-card)' }}
      >
        <button
          className="flex-1 py-3 text-sm font-semibold press-effect"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            color: 'var(--tg-theme-text-color)',
            borderRadius: 'var(--storex-radius-md)',
          }}
          onClick={handleClear}
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
          onClick={handleApply}
        >
          {previewTotal === undefined ? "Natijalarni ko'rish" : `${previewTotal} ta natijani ko'rish`}
        </button>
      </div>
    </div>
  );
}

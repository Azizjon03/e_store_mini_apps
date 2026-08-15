import type { PaginatedResponse, Product, ProductFilters } from '@/api/types';

/**
 * Everything editable inside Catalog's filter BottomSheet. Category (the
 * chip row above the sheet) and sort (its own sheet) live as separate state
 * in Catalog.tsx — they aren't "filters" in this narrower sense.
 */
export interface CatalogFilterValues {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  discountOnly: boolean;
  brands: number[];
  attributes: Record<string, string[]>;
}

export const EMPTY_CATALOG_FILTERS: CatalogFilterValues = {
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  discountOnly: false,
  brands: [],
  attributes: {},
};

/**
 * Minimum-rating steps worth offering. A product with no approved review
 * never matches any of them. Finer steps (2+, 1+) aren't offered — on a
 * small catalogue they're noise, and there's no signal here for which steps
 * actually return results.
 */
export const RATING_OPTIONS = [4, 3] as const;

/**
 * Maps filter-sheet selections onto the slice of `ProductFilters` the
 * `/products` endpoint reads, collapsing "nothing selected" to `undefined`
 * so it's omitted from the request the same way the rest of `ProductFilters`
 * already does (see `discount_only` in the original Catalog.tsx).
 */
export function toProductFilterParams(
  values: CatalogFilterValues,
): Pick<
  ProductFilters,
  'min_price' | 'max_price' | 'rating' | 'discount_only' | 'brands' | 'attributes'
> {
  return {
    min_price: values.minPrice,
    max_price: values.maxPrice,
    rating: values.minRating,
    discount_only: values.discountOnly || undefined,
    brands: values.brands.length > 0 ? values.brands : undefined,
    attributes: Object.keys(values.attributes).length > 0 ? values.attributes : undefined,
  };
}

/**
 * How many independent filter "dimensions" are active — the `Filtr (N)`
 * fallback for when the server's response doesn't carry
 * `applied_filters_count` (see `getAppliedFilterCount`). Min/max price count
 * separately, same as the original single-price-range implementation;
 * brands and each attribute group count once regardless of how many values
 * are selected inside them, since they read as one active "dimension" to
 * the shopper.
 */
export function countCatalogFilters(values: CatalogFilterValues): number {
  let count = 0;
  if (values.minPrice) count += 1;
  if (values.maxPrice) count += 1;
  if (values.minRating) count += 1;
  if (values.discountOnly) count += 1;
  if (values.brands.length > 0) count += 1;
  count += Object.values(values.attributes).filter((selected) => selected.length > 0).length;
  return count;
}

// The `/products` meta the backend returns includes `applied_filters_count`
// per BACKEND_TASKS.md, but `PaginatedResponse['meta']` (frozen in
// src/api/types.ts) doesn't declare it — so this reads it defensively at the
// call site instead of assuming the field exists.
type ProductsMetaWithFilterCount = PaginatedResponse<Product>['meta'] & {
  applied_filters_count?: number;
};

/**
 * Prefers the server's own count of applied filters (computed off whatever
 * params it actually received) over the client's local tally, falling back
 * to `countCatalogFilters` only when the field isn't present in the
 * response.
 */
export function getAppliedFilterCount(
  meta: ProductsMetaWithFilterCount | undefined,
  fallback: CatalogFilterValues,
): number {
  if (meta && typeof meta.applied_filters_count === 'number') {
    return meta.applied_filters_count;
  }
  return countCatalogFilters(fallback);
}

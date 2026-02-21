import { useInfiniteQuery } from '@tanstack/react-query';
import { getProducts } from '@/api/storefront';
import type { ProductFilters } from '@/api/types';

export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({ pageParam = 1 }) =>
      getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

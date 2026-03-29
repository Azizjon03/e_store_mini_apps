import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHomeData, getProducts } from '@/api/storefront';
import type { FlashSale } from '@/api/types';
import { PageLayout } from '@/components/layout/PageLayout';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryChips } from '@/components/home/CategoryChips';
import { HomeSections } from '@/components/home/HomeSections';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';
import { PullToRefresh } from '@/components/ui/PullToRefresh';

function HomeSkeleton() {
  return (
    <div className="page-enter">
      {/* Banner skeleton */}
      <Skeleton className="mx-4 mt-2 mb-1 h-45" />

      {/* Category chips skeleton */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-3 w-10 rounded-(--storex-radius-sm)" />
            </div>
          ))}
        </div>
      </div>

      <div className="storex-divider" />

      {/* Products skeleton */}
      <div className="px-4 py-3">
        <div className="flex justify-between mb-3">
          <Skeleton className="h-5 w-28 rounded-(--storex-radius-sm)" />
          <Skeleton className="h-4 w-16 rounded-(--storex-radius-sm)" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: getHomeData,
  });

  const hasSections = data && data.sections.length > 0;
  const { data: productsData } = useQuery({
    queryKey: ['products', 'home-fallback'],
    queryFn: () => getProducts({ page: 1, per_page: 20, sort: 'popular' }),
    enabled: !!data && !hasSections,
  });

  const handleRefresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['home'] }),
    [queryClient],
  );

  const fallbackProducts = productsData?.data ?? [];

  return (
    <PageLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        {isLoading || !data ? (
          <HomeSkeleton />
        ) : (
          <div className="page-enter">
            {data.banners.length > 0 && <HeroBanner banners={data.banners} />}
            {data.categories.length > 0 && <CategoryChips categories={data.categories} />}

            {(data.banners.length > 0 || data.categories.length > 0) && (
              <div className="storex-divider" />
            )}

            {data.flash_sale && data.flash_sale.products.length > 0 && (
              <>
                <FlashSaleSection flashSale={data.flash_sale} />
                <div className="storex-divider" />
              </>
            )}

            {hasSections ? (
              <HomeSections sections={data.sections} bannersMid={data.banners_mid} />
            ) : fallbackProducts.length > 0 ? (
              <section className="py-3">
                <div className="storex-section-header">
                  <h2 className="storex-section-title">Ommabop</h2>
                </div>
                <ProductGrid products={fallbackProducts} />
              </section>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-5xl mb-4">🏪</div>
                <p
                  className="text-base font-semibold text-center"
                  style={{ color: 'var(--tg-theme-text-color)' }}
                >
                  Tez orada mahsulotlar qo'shiladi
                </p>
                <p
                  className="text-sm text-center mt-1"
                  style={{ color: 'var(--tg-theme-hint-color)' }}
                >
                  Do'kon hozircha sozlanmoqda
                </p>
              </div>
            )}
          </div>
        )}
      </PullToRefresh>
    </PageLayout>
  );
}

function FlashSaleSection({ flashSale }: { flashSale: FlashSale }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calcTimeLeft() {
      const diff = new Date(flashSale.ends_at).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(''); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }
    calcTimeLeft();
    const interval = setInterval(calcTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [flashSale.ends_at]);

  if (!timeLeft) return null;

  return (
    <section className="py-3">
      <div className="storex-section-header">
        <h2 className="storex-section-title">{flashSale.title}</h2>
        <span
          className="text-[13px] font-bold px-2 py-0.5"
          style={{
            backgroundColor: 'var(--storex-danger)',
            color: '#fff',
            borderRadius: 'var(--storex-radius-xs)',
          }}
        >
          {timeLeft}
        </span>
      </div>
      <ProductGrid products={flashSale.products} />
    </section>
  );
}

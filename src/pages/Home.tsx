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
      <Skeleton className="mx-4 mt-3 mb-2 h-40 rounded-(--storex-radius-lg)" />

      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-4 gap-y-4 gap-x-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-14 h-14 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-(--storex-radius-sm)" />
            </div>
          ))}
        </div>
      </div>

      <div className="storex-divider" />

      <div className="storex-section">
        <div className="storex-section-header">
          <Skeleton className="h-5 w-28 rounded-(--storex-radius-sm)" />
          <Skeleton className="h-4 w-16 rounded-(--storex-radius-sm)" />
        </div>
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
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
              <>
                {data.banners.length === 0 && (
                  <div className="px-4 pt-3">
                    <div
                      className="relative overflow-hidden flex flex-col items-start justify-end p-5"
                      style={{
                        height: 140,
                        borderRadius: 'var(--storex-radius-lg)',
                        background:
                          'linear-gradient(135deg, var(--storex-primary), color-mix(in srgb, var(--storex-primary) 65%, #a855f7))',
                      }}
                    >
                      <p className="text-white text-[11px] uppercase tracking-wider opacity-80 mb-1">
                        Xush kelibsiz
                      </p>
                      <p className="text-white text-[20px] font-bold leading-tight">
                        Yangi mahsulotlarni kashf qiling
                      </p>
                    </div>
                  </div>
                )}
                <section className="storex-section">
                  <div className="storex-section-header">
                    <h2 className="storex-section-title">Ommabop</h2>
                  </div>
                  <ProductGrid products={fallbackProducts} />
                </section>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4">
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
    <section className="storex-section">
      <div className="storex-section-header">
        <h2 className="storex-section-title">{flashSale.title}</h2>
        <span
          className="text-[13px] font-bold px-2 py-1 tabular-nums"
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

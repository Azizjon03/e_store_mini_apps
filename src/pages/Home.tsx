import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHomeData, getProducts } from '@/api/storefront';
import type { FlashSale, HomeSection, Product } from '@/api/types';
import { PageLayout } from '@/components/layout/PageLayout';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryChips } from '@/components/home/CategoryChips';
import { HomeSections } from '@/components/home/HomeSections';
import { ProductSection } from '@/components/product/ProductSection';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { EmptyState } from '@/components/ui/EmptyState';

// Same section->link mapping HomeSections.tsx uses internally. Duplicated
// (not imported) rather than exported cross-file, since a shared non-component
// export from a component file trips react-refresh/only-export-components,
// and this change's scope is limited to Home.tsx / HomeSections.tsx /
// HeroBanner.tsx / types.ts / ProductSection.tsx — no new shared-utils file.
function getSectionLink(section: HomeSection): string | undefined {
  switch (section.type) {
    case 'sale':
      return '/catalog?sort=popular&discount_only=true';
    case 'new':
      return '/catalog?sort=newest';
    case 'popular':
      return '/catalog?sort=popular';
    case 'category':
      return section.category_slug ? `/catalog/${section.category_slug}` : undefined;
  }
}

// Skeleton mirrors the real block order — CategoryChips, divider, first
// product section (grid), hero — so there's no layout jump once data lands.
function HomeSkeleton() {
  return (
    <div className="page-enter">
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

      <Skeleton className="mx-4 mt-3 mb-2 h-40 rounded-(--storex-radius-lg)" />
    </div>
  );
}

// The "Ommabop" fallback grid used when the server sends zero sections. Kept
// as its own component so it can be reused above and below the flash-sale
// slot without duplicating JSX.
function FallbackPopularSection({ products }: { products: Product[] }) {
  return (
    <section className="storex-section">
      <div className="storex-section-header">
        <h2 className="storex-section-title">Ommabop</h2>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

// Hero-like placeholder used only when there are zero real banners to show
// in the hero slot. Mirrors the pre-existing hardcoded welcome block, just
// repositioned below the first product content instead of above it.
function WelcomeBlock() {
  return (
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

  // A live flash sale wins the above-the-fold slot (right after
  // CategoryChips). Everything else that would normally sit there — the
  // first regular section, or the zero-section "Ommabop" fallback — is
  // pushed below the hero instead. Same "has products" liveness check
  // FlashSaleSection itself uses below (it further hides on actual expiry
  // via its own hasExpired effect, not here — Date.now() can't be called
  // during render).
  const hasLiveFlashSale = !!data?.flash_sale && data.flash_sale.products.length > 0;

  const firstSection = hasSections ? data!.sections[0] : undefined;
  const remainingSections = hasSections ? data!.sections.slice(1) : [];

  return (
    <PageLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        {isLoading || !data ? (
          <HomeSkeleton />
        ) : (
          <div className="page-enter">
            {data.categories.length > 0 && <CategoryChips categories={data.categories} />}
            {data.categories.length > 0 && <div className="storex-divider" />}

            {hasSections ? (
              <>
                {hasLiveFlashSale ? (
                  <FlashSaleSection flashSale={data.flash_sale!} />
                ) : (
                  <ProductSection
                    title={firstSection!.title}
                    products={firstSection!.products}
                    linkTo={getSectionLink(firstSection!)}
                    layout="grid"
                  />
                )}

                {data.banners.length > 0 && <HeroBanner banners={data.banners} />}

                <HomeSections
                  sections={hasLiveFlashSale ? data.sections : remainingSections}
                  bannersMid={data.banners_mid}
                />
              </>
            ) : fallbackProducts.length > 0 ? (
              <>
                {hasLiveFlashSale ? (
                  <FlashSaleSection flashSale={data.flash_sale!} />
                ) : (
                  <FallbackPopularSection products={fallbackProducts} />
                )}

                {data.banners.length > 0 ? (
                  <HeroBanner banners={data.banners} />
                ) : (
                  <WelcomeBlock />
                )}

                {hasLiveFlashSale && <FallbackPopularSection products={fallbackProducts} />}
              </>
            ) : (
              <>
                {hasLiveFlashSale && <FlashSaleSection flashSale={data.flash_sale!} />}
                {hasLiveFlashSale && data.banners.length > 0 && (
                  <HeroBanner banners={data.banners} />
                )}
                <EmptyState
                  icon="🏪"
                  title="Tez orada mahsulotlar qo'shiladi"
                  description="Do'kon hozircha sozlanmoqda"
                />
              </>
            )}
          </div>
        )}
      </PullToRefresh>
    </PageLayout>
  );
}

// Holds only the "has the sale actually expired" boolean, derived from the
// same 1s tick FlashSaleCountdown uses below — but this state only flips
// once (false -> true), so React bails out of re-rendering on every other
// tick (same value === no re-render). That keeps ProductGrid mounted here
// from re-rendering every second; only the leaf countdown does that.
function FlashSaleSection({ flashSale }: { flashSale: FlashSale }) {
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    function checkExpiry() {
      const diff = new Date(flashSale.ends_at).getTime() - Date.now();
      if (diff <= 0) setHasExpired(true);
    }
    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [flashSale.ends_at]);

  if (hasExpired) return null;

  return (
    <section className="storex-section">
      <div className="storex-section-header">
        <h2 className="storex-section-title">{flashSale.title}</h2>
        <FlashSaleCountdown endsAt={flashSale.ends_at} />
      </div>
      <ProductGrid products={flashSale.products} />
    </section>
  );
}

// Leaf: owns the per-second string and its own interval, isolated from
// FlashSaleSection so the product grid next to it doesn't re-render 3600
// times an hour.
function FlashSaleCountdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calcTimeLeft() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(''); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }
    calcTimeLeft();
    const interval = setInterval(calcTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!timeLeft) return null;

  return (
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
  );
}

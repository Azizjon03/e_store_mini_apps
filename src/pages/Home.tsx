import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHomeData } from '@/api/storefront';
import { PageLayout } from '@/components/layout/PageLayout';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryChips } from '@/components/home/CategoryChips';
import { HomeSections } from '@/components/home/HomeSections';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { PullToRefresh } from '@/components/ui/PullToRefresh';

function HomeSkeleton() {
  return (
    <div>
      <Skeleton className="mx-4 mt-2 mb-3 h-[160px]" />
      <div className="flex gap-2 px-4 py-2 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-[20px] shrink-0" />
        ))}
      </div>
      <div className="px-4 py-3">
        <Skeleton className="h-5 w-40 mb-3" />
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

  const handleRefresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['home'] }),
    [queryClient],
  );

  return (
    <PageLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        {isLoading || !data ? (
          <HomeSkeleton />
        ) : (
          <>
            <HeroBanner banners={data.banners} />
            <CategoryChips categories={data.categories} />
            <HomeSections sections={data.sections} bannersMid={data.banners_mid} />
          </>
        )}
      </PullToRefresh>
    </PageLayout>
  );
}

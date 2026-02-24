import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, removeFromFavorites } from '@/api/storefront';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, t } from '@/lib/format';
import { useHaptic } from '@/hooks/useHaptic';
import { useCartStore } from '@/store/cartStore';
import { showToast } from '@/lib/toast';

export default function Favorites() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const queryClient = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => removeFromFavorites(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      haptic.notification('success');
    },
  });

  return (
    <PageLayout showSearch={false}>
      {isLoading ? (
        <div className="px-4 py-4 flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="Sevimlilar bo'sh"
          description="Yoqtirgan mahsulotlaringizni shu yerda ko'ring"
          action={{ label: "Katalogga o'tish", onClick: () => navigate('/catalog') }}
        />
      ) : (
        <div className="px-4 py-4 flex flex-col gap-3">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="flex gap-3 p-3 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
              style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
              onClick={() => {
                haptic.selectionChanged();
                navigate(`/product/${product.slug}`);
              }}
            >
              <div
                className="w-20 h-20 rounded-lg overflow-hidden shrink-0"
                style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
              >
                {product.image ? (
                  <img src={product.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium line-clamp-2" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {t(product.name)}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                      {formatPrice(product.price)}
                    </span>
                    {product.old_price && (
                      <span className="text-xs line-through" style={{ color: 'var(--store-price-old)' }}>
                        {formatPrice(product.old_price)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    className="h-8 px-3 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.variants && product.variants.length > 0) {
                        navigate(`/product/${product.slug}`);
                        return;
                      }
                      addItem(product, 1);
                      haptic.impact('light');
                      showToast('success', "Savatga qo'shildi");
                    }}
                  >
                    Savatga
                  </button>
                  <button
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMutation.mutate(product.id);
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

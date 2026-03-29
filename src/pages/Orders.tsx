import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, reorderProducts } from '@/api/storefront';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/lib/format';
import { useHaptic } from '@/hooks/useHaptic';
import { showToast } from '@/lib/toast';
import type { OrderStatus } from '@/api/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Yangi', color: 'var(--storex-warning)' },
  confirmed: { label: 'Tasdiqlangan', color: 'var(--storex-info)' },
  processing: { label: 'Tayyorlanmoqda', color: 'var(--storex-info)' },
  delivering: { label: "Yo'lda", color: 'var(--storex-primary)' },
  delivered: { label: 'Yetkazildi', color: 'var(--storex-success)' },
  cancelled: { label: 'Bekor qilingan', color: 'var(--storex-danger)' },
  returned: { label: 'Qaytarildi', color: 'var(--tg-theme-hint-color)' },
};

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'Hammasi', value: 'all' },
  { label: 'Yangi', value: 'pending' },
  { label: 'Tayyorlanmoqda', value: 'processing' },
  { label: "Yo'lda", value: 'delivering' },
  { label: 'Yetkazildi', value: 'delivered' },
  { label: 'Bekor qilingan', value: 'cancelled' },
];

export default function Orders() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', activeFilter],
    queryFn: () => getOrders(1, activeFilter),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderId: number) => reorderProducts(orderId),
    onSuccess: () => {
      haptic.notification('success');
      showToast('success', "Mahsulotlar savatga qo'shildi");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate('/cart');
    },
    onError: () => {
      showToast('error', 'Xatolik yuz berdi');
      haptic.notification('error');
    },
  });

  const orders = data?.data ?? [];

  return (
    <PageLayout showSearch={false}>
      {/* Status filter tabs */}
      <div
        className="sticky top-0 z-20 px-4 py-2 overflow-x-auto scrollbar-hide"
        style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
      >
        <div className="flex gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`storex-chip ${activeFilter === tab.value ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter(tab.value);
                haptic.selectionChanged();
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-4 flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-35 w-full rounded-(--storex-radius-md)" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="---"
          title="Buyurtmalar yo'q"
          description={activeFilter === 'all' ? "Birinchi buyurtmangizni bering!" : "Bu bo'limda buyurtmalar yo'q"}
          action={{ label: "Katalogga o'tish", onClick: () => navigate('/catalog') }}
        />
      ) : (
        <div className="px-4 py-3 flex flex-col gap-3">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status];
            return (
              <div
                key={order.id}
                className="storex-card overflow-hidden"
              >
                {/* Card header */}
                <div className="px-4 pt-3 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[15px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                      #{order.number}
                    </span>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5"
                      style={{
                        borderRadius: 'var(--storex-radius-xs)',
                        backgroundColor: `color-mix(in srgb, ${status.color} 12%, transparent)`,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {formatDate(order.created_at)}
                  </p>
                </div>

                {/* Product thumbnails */}
                <div className="px-4 py-2 flex items-center gap-1.5">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="w-12 h-12 overflow-hidden shrink-0"
                      style={{
                        borderRadius: 'var(--storex-radius-sm)',
                        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                      }}
                    >
                      {item.product.image ? (
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--tg-theme-hint-color)' }}>
                            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div
                      className="w-12 h-12 flex items-center justify-center shrink-0 text-[13px] font-medium"
                      style={{
                        borderRadius: 'var(--storex-radius-sm)',
                        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                        color: 'var(--tg-theme-hint-color)',
                      }}
                    >
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Footer: items count + price */}
                <div
                  className="px-4 py-2 flex items-center justify-between"
                  style={{ borderTop: '1px solid var(--storex-border)' }}
                >
                  <span className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {order.items.length} ta mahsulot
                  </span>
                  <span className="text-[15px] font-bold" style={{ color: 'var(--storex-primary)' }}>
                    {formatPrice(order.total_price)}
                  </span>
                </div>

                {/* Action buttons */}
                <div
                  className="px-4 py-2.5 flex gap-2"
                  style={{ borderTop: '1px solid var(--storex-border)' }}
                >
                  <button
                    className="flex-1 py-2 text-[13px] font-medium press-effect"
                    style={{
                      borderRadius: 'var(--storex-radius-sm)',
                      backgroundColor: 'var(--storex-primary)',
                      color: '#fff',
                    }}
                    onClick={() => {
                      haptic.selectionChanged();
                      navigate(`/orders/${order.id}`);
                    }}
                  >
                    Batafsil
                  </button>
                  <button
                    className="flex-1 py-2 text-[13px] font-medium press-effect"
                    style={{
                      borderRadius: 'var(--storex-radius-sm)',
                      backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                      color: 'var(--tg-theme-text-color)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic.selectionChanged();
                      reorderMutation.mutate(order.id);
                    }}
                    disabled={reorderMutation.isPending}
                  >
                    Qayta buyurtma
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

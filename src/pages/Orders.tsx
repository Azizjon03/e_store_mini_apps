import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/api/storefront';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/lib/format';
import { useHaptic } from '@/hooks/useHaptic';
import type { OrderStatus } from '@/api/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Kutilmoqda', color: '#e8a427' },
  confirmed: { label: 'Tasdiqlangan', color: '#2481cc' },
  processing: { label: 'Tayyorlanmoqda', color: '#2481cc' },
  delivering: { label: 'Yetkazilmoqda', color: '#2481cc' },
  delivered: { label: 'Yetkazildi', color: '#31b545' },
  cancelled: { label: 'Bekor qilindi', color: '#e53e3e' },
  returned: { label: 'Qaytarildi', color: '#999' },
};

export default function Orders() {
  const navigate = useNavigate();
  const haptic = useHaptic();

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(1),
  });

  const orders = data?.data ?? [];

  return (
    <PageLayout showSearch={false}>
      {isLoading ? (
        <div className="px-4 py-4 flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Buyurtmalar yo'q"
          description="Birinchi buyurtmangizni bering!"
          action={{ label: "Katalogga o'tish", onClick: () => navigate('/catalog') }}
        />
      ) : (
        <div className="px-4 py-4 flex flex-col gap-3">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status];
            return (
              <button
                key={order.id}
                className="w-full text-left p-4 rounded-xl transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
                onClick={() => {
                  haptic.selectionChanged();
                  navigate(`/orders/${order.id}`);
                }}
              >
                {/* Header: order number + status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                    #{order.number}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: status.color + '20', color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Date */}
                <p className="text-xs mb-3" style={{ color: 'var(--tg-theme-hint-color)' }}>
                  {formatDate(order.created_at)}
                </p>

                {/* Product images */}
                <div className="flex items-center gap-1 mb-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                      style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
                    >
                      {item.product.image ? (
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">📷</div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs ml-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      +{order.items.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {order.items.length} ta mahsulot
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                      {formatPrice(order.total_price)}
                    </span>
                    <span style={{ color: 'var(--tg-theme-hint-color)' }}>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

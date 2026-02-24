import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderDetail, reorderProducts } from '@/api/storefront';
import { formatPrice, formatDateTime, t } from '@/lib/format';
import { useHaptic } from '@/hooks/useHaptic';
import { showToast } from '@/lib/toast';
import { Spinner } from '@/components/ui/Spinner';
import type { OrderStatus } from '@/api/types';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Kutilmoqda', color: '#e8a427', icon: '🟡' },
  confirmed: { label: 'Tasdiqlangan', color: '#2481cc', icon: '🔵' },
  processing: { label: 'Tayyorlanmoqda', color: '#2481cc', icon: '🔵' },
  delivering: { label: 'Yetkazilmoqda', color: '#2481cc', icon: '🔵' },
  delivered: { label: 'Yetkazildi', color: '#31b545', icon: '🟢' },
  cancelled: { label: 'Bekor qilindi', color: '#e53e3e', icon: '🔴' },
  returned: { label: 'Qaytarildi', color: '#999', icon: '⚫' },
};

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'processing', 'delivering', 'delivered'];

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderDetail(Number(orderId)),
    enabled: !!orderId,
  });

  const reorderMutation = useMutation({
    mutationFn: () => reorderProducts(Number(orderId)),
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

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <Spinner className="py-20" />
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = STATUS_CONFIG[order.status];
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'returned';

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
            Buyurtma #{order.number}
          </h1>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: currentStatus.color + '20', color: currentStatus.color }}
          >
            {currentStatus.icon} {currentStatus.label}
          </span>
        </div>

        {/* Status Timeline */}
        {!isCancelled && (
          <section className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--tg-theme-text-color)' }}>
              Status
            </h3>
            <div className="flex flex-col">
              {STATUS_ORDER.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isLast = index === STATUS_ORDER.length - 1;
                const config = STATUS_CONFIG[status];
                const trackEntry = order.tracking?.find((t) => t.status === status);

                return (
                  <div key={status} className="flex gap-3">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isCompleted ? config.color : 'var(--tg-theme-hint-color, #ccc)',
                          opacity: isCompleted ? 1 : 0.3,
                        }}
                      >
                        {isCompleted && !isCurrent && (
                          <span className="text-white text-[8px]">✓</span>
                        )}
                        {isCurrent && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className="w-0.5 h-8"
                          style={{
                            backgroundColor: index < currentStatusIndex
                              ? config.color
                              : 'var(--tg-theme-hint-color, #ccc)',
                            opacity: index < currentStatusIndex ? 1 : 0.3,
                          }}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="pb-6">
                      <p
                        className="text-sm font-medium"
                        style={{ color: isCompleted ? 'var(--tg-theme-text-color)' : 'var(--tg-theme-hint-color)' }}
                      >
                        {config.label}
                      </p>
                      {trackEntry && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--tg-theme-hint-color)' }}>
                          {formatDateTime(trackEntry.timestamp)}
                        </p>
                      )}
                      {trackEntry?.driver_phone && isCurrent && (
                        <a
                          href={`tel:${trackEntry.driver_phone}`}
                          className="text-xs mt-1 inline-block"
                          style={{ color: 'var(--tg-theme-link-color)' }}
                        >
                          📞 {trackEntry.driver_phone}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <hr style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Order items */}
        <section className="my-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
            Buyurtma tarkibi
          </h3>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-xl cursor-pointer"
                style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
                onClick={() => navigate(`/product/${item.product.slug}`)}
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
                  {item.product.image ? (
                    <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">📷</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-1" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {t(item.product.name)}
                  </p>
                  {item.variant && (
                    <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      {item.variant.name}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {formatPrice(item.price)} x {item.quantity} = {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Shipping address */}
        {order.shipping_address && (
          <section className="my-6">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
              Yetkazish manzili
            </h3>
            <p className="text-sm" style={{ color: 'var(--tg-theme-text-color)' }}>
              📍 {order.shipping_address.city}, {order.shipping_address.district}, {order.shipping_address.full_address}
            </p>
          </section>
        )}

        {/* Payment */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
            To'lov
          </h3>
          <p className="text-sm" style={{ color: 'var(--tg-theme-text-color)' }}>
            💳 {order.payment_method === 'click' ? 'Click' : order.payment_method === 'payme' ? 'Payme' : "Naqd to'lov"}
          </p>
        </section>

        <hr style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Price breakdown */}
        <section className="my-6">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>Mahsulotlar</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>
              {formatPrice(order.total_price + order.discount - order.delivery_cost)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--tg-theme-hint-color)' }}>Chegirma</span>
              <span style={{ color: 'var(--store-price-sale)' }}>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>Yetkazish</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>
              {order.delivery_cost > 0 ? formatPrice(order.delivery_cost) : 'Bepul'}
            </span>
          </div>
          <div className="flex justify-between text-[16px] font-semibold pt-2" style={{ borderTop: '1px solid var(--tg-theme-secondary-bg-color)' }}>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>Jami</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>{formatPrice(order.total_price)}</span>
          </div>
        </section>

        <hr style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            className="w-full py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            onClick={() => reorderMutation.mutate()}
            disabled={reorderMutation.isPending}
          >
            {reorderMutation.isPending ? '...' : '🔄 Qayta buyurtma berish'}
          </button>
          <button
            className="w-full py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
            onClick={() => {
              if (isTelegramWebApp) {
                WebApp.openTelegramLink('https://t.me/estore_support');
              } else {
                window.open('https://t.me/estore_support', '_blank');
              }
            }}
          >
            📞 Qo'llab-quvvatlash
          </button>
        </div>
      </div>
    </div>
  );
}

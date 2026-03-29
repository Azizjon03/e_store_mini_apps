import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderDetail, reorderProducts } from '@/api/storefront';
import { formatPrice, formatDateTime, t } from '@/lib/format';
import { useHaptic } from '@/hooks/useHaptic';
import { useBackButton } from '@/hooks/useBackButton';
import { showToast } from '@/lib/toast';
import { Spinner } from '@/components/ui/Spinner';
import type { OrderStatus } from '@/api/types';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Kutilmoqda', color: 'var(--storex-warning)' },
  confirmed: { label: 'Tasdiqlangan', color: 'var(--storex-info)' },
  processing: { label: 'Tayyorlanmoqda', color: 'var(--storex-info)' },
  delivering: { label: 'Yetkazilmoqda', color: 'var(--storex-primary)' },
  delivered: { label: 'Yetkazildi', color: 'var(--storex-success)' },
  cancelled: { label: 'Bekor qilindi', color: 'var(--storex-danger)' },
  returned: { label: 'Qaytarildi', color: 'var(--tg-theme-hint-color)' },
};

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'processing', 'delivering', 'delivered'];

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const queryClient = useQueryClient();
  useBackButton();

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
    <div className="min-h-screen pb-8" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
      {/* Header */}
      <div className="px-4 py-4" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-[17px] font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
            Buyurtma #{order.number}
          </h1>
          <span
            className="text-[11px] font-semibold px-2.5 py-1"
            style={{
              borderRadius: 'var(--storex-radius-xs)',
              backgroundColor: `color-mix(in srgb, ${currentStatus.color} 12%, transparent)`,
              color: currentStatus.color,
            }}
          >
            {currentStatus.label}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <>
          <div className="storex-divider" />
          <section className="storex-card mx-4 mt-3 p-4">
            <p className="text-[15px] font-semibold mb-4" style={{ color: 'var(--tg-theme-text-color)' }}>
              Holat
            </p>
            <div className="flex flex-col">
              {STATUS_ORDER.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isLast = index === STATUS_ORDER.length - 1;
                const config = STATUS_CONFIG[status];
                const trackEntry = order.tracking?.find((tr) => tr.status === status);

                return (
                  <div key={status} className="flex gap-3">
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isCompleted ? config.color : 'var(--storex-border)',
                        }}
                      >
                        {isCompleted && !isCurrent && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4l1.5 1.5L6.5 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {isCurrent && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className="w-0.5 h-8"
                          style={{
                            backgroundColor: index < currentStatusIndex ? config.color : 'var(--storex-border)',
                          }}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="pb-6">
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: isCompleted ? 'var(--tg-theme-text-color)' : 'var(--tg-theme-hint-color)' }}
                      >
                        {config.label}
                      </p>
                      {trackEntry && (
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--tg-theme-hint-color)' }}>
                          {formatDateTime(trackEntry.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* Courier info card */}
      {order.status === 'delivering' && order.tracking && (() => {
        const deliveryTrack = order.tracking.find((tr) => tr.status === 'delivering');
        if (!deliveryTrack) return null;
        const driverName = deliveryTrack.driver?.name;
        const driverPhone = deliveryTrack.driver?.phone ?? deliveryTrack.driver_phone;
        const estimatedTime = deliveryTrack.estimated_delivery ?? order.estimated_delivery;
        if (!driverPhone && !driverName && !estimatedTime) return null;
        return (
          <section className="storex-card mx-4 mt-3 p-4">
            <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Kuryer ma'lumotlari
            </p>
            {(driverName || driverPhone) && (
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--storex-primary-light)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--storex-primary)' }}>
                    <circle cx="9" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {driverName ?? 'Kuryer'}
                  </p>
                  {driverPhone && (
                    <a
                      href={`tel:${driverPhone}`}
                      className="text-[13px]"
                      style={{ color: 'var(--storex-primary)' }}
                    >
                      {driverPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
            {estimatedTime && (
              <div className="flex items-center gap-2 mt-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--tg-theme-hint-color)' }}>
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 3.5V7l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
                  Taxminiy vaqt: {estimatedTime}
                </span>
              </div>
            )}
          </section>
        );
      })()}

      {/* Order items */}
      <div className="storex-divider mt-3" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
            Buyurtma tarkibi
          </p>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="storex-card press-effect flex gap-3 p-3 cursor-pointer"
                onClick={() => navigate(`/product/${item.product.slug}`)}
              >
                <div
                  className="w-14 h-14 overflow-hidden shrink-0"
                  style={{
                    borderRadius: 'var(--storex-radius-sm)',
                    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  }}
                >
                  {item.product.image ? (
                    <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--tg-theme-hint-color)' }}>
                        <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="7" cy="7.5" r="2" stroke="currentColor" strokeWidth="1" />
                        <path d="M2 14l4-3.5 3.5 3L14 9l4 5v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" fill="currentColor" opacity="0.15" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium line-clamp-1" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {t(item.product.name)}
                  </p>
                  {item.variant && (
                    <p className="text-[11px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      {item.variant.name}
                    </p>
                  )}
                  <p className="text-[11px] mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <span className="text-[13px] font-semibold self-center" style={{ color: 'var(--storex-primary)' }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping address */}
      {order.shipping_address && (
        <>
          <div className="storex-divider" />
          <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
            <div className="px-4 py-3">
              <p className="text-[15px] font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
                Yetkazish manzili
              </p>
              <div className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" style={{ color: 'var(--storex-primary)' }}>
                  <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z" fill="currentColor" opacity="0.15" />
                  <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="8" cy="6" r="1.5" fill="currentColor" />
                </svg>
                <p className="text-[13px]" style={{ color: 'var(--tg-theme-text-color)' }}>
                  {order.shipping_address.city}, {order.shipping_address.district}, {order.shipping_address.full_address}
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Payment method */}
      <div className="storex-divider" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <p className="text-[15px] font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
            To'lov usuli
          </p>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--tg-theme-hint-color)' }}>
              <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <p className="text-[13px]" style={{ color: 'var(--tg-theme-text-color)' }}>
              {order.payment_method_name ?? (order.payment_method === 'click' ? 'Click' : order.payment_method === 'payme' ? 'Payme' : "Naqd to'lov")}
            </p>
          </div>
        </div>
      </section>

      {/* Price breakdown */}
      <div className="storex-divider" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
            To'lov xulosasi
          </p>
          <div className="flex justify-between text-[13px] mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>Mahsulotlar</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>
              {formatPrice(order.total_price + order.discount - order.delivery_cost)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[13px] mb-2">
              <span style={{ color: 'var(--tg-theme-hint-color)' }}>Chegirma</span>
              <span style={{ color: 'var(--storex-danger)' }}>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[13px] mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>Yetkazish</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>
              {order.delivery_cost > 0 ? formatPrice(order.delivery_cost) : 'Bepul'}
            </span>
          </div>
          <div
            className="flex justify-between text-[17px] font-bold pt-3 mt-2"
            style={{ borderTop: '1px solid var(--storex-border)' }}
          >
            <span style={{ color: 'var(--tg-theme-text-color)' }}>Jami</span>
            <span style={{ color: 'var(--storex-primary)' }}>{formatPrice(order.total_price)}</span>
          </div>
        </div>
      </section>

      {/* Action buttons */}
      <div className="px-4 mt-4 flex flex-col gap-2">
        <button
          className="w-full py-3 text-[15px] font-semibold press-effect"
          style={{
            borderRadius: 'var(--storex-radius-md)',
            backgroundColor: 'var(--storex-primary)',
            color: '#fff',
          }}
          onClick={() => reorderMutation.mutate()}
          disabled={reorderMutation.isPending}
        >
          {reorderMutation.isPending ? '...' : 'Qayta buyurtma berish'}
        </button>
        <button
          className="w-full py-3 text-[15px] font-medium press-effect"
          style={{
            borderRadius: 'var(--storex-radius-md)',
            backgroundColor: 'var(--tg-theme-bg-color)',
            color: 'var(--tg-theme-text-color)',
            boxShadow: 'var(--storex-shadow-card)',
          }}
          onClick={() => {
            if (isTelegramWebApp) {
              WebApp.openTelegramLink('https://t.me/estore_support');
            } else {
              window.open('https://t.me/estore_support', '_blank');
            }
          }}
        >
          Yordam
        </button>
      </div>
    </div>
  );
}

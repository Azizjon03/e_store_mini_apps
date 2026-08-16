import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderDetail } from '@/api/storefront';
import { formatPrice, formatDateTime, t } from '@/lib/format';
import { formatAddressLine } from '@/lib/address';
import { getPaymentMethodLabel } from '@/lib/payment';
import { useHaptic } from '@/hooks/useHaptic';
import { useBackButton } from '@/hooks/useBackButton';
import { showToast } from '@/lib/toast';
import { Spinner } from '@/components/ui/Spinner';
import { PageLayout } from '@/components/layout/PageLayout';
import { useCartStore, makeItemId } from '@/store/cartStore';
import type { CartItem, Order, OrderStatus } from '@/api/types';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Kutilmoqda', color: 'var(--storex-warning)' },
  confirmed: { label: 'Tasdiqlangan', color: 'var(--storex-info)' },
  processing: { label: 'Tayyorlanmoqda', color: 'var(--storex-info)' },
  shipped: { label: 'Yetkazilmoqda', color: 'var(--storex-primary)' },
  delivered: { label: 'Yetkazildi', color: 'var(--storex-success)' },
  cancelled: { label: 'Bekor qilindi', color: 'var(--storex-danger)' },
  refunded: { label: 'Qaytarildi', color: 'var(--tg-theme-hint-color)' },
};

// Defensive fallback: the backend enum can grow without the frontend knowing,
// so an unrecognized status must never crash the page (see getStatusConfig).
const UNKNOWN_STATUS_CONFIG = { label: 'Nomaʼlum holat', color: 'var(--tg-theme-hint-color)' };

function getStatusConfig(status: OrderStatus) {
  return STATUS_CONFIG[status] ?? UNKNOWN_STATUS_CONFIG;
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

// Reorder is filled purely client-side from the order's own items — the
// server's /orders/{id}/reorder cart gets wiped by checkout's clearCart()
// sync anyway, so trusting that round-trip never actually worked. Historical
// item.price is used (not live product price) since that's the only price
// this stub data carries, and it faithfully reproduces what the order shows.
function addOrderItemsToCart(order: Order) {
  const newItems: CartItem[] = order.items.map((item) => ({
    id: makeItemId(item.product_id, item.variant?.id),
    product_id: item.product_id,
    product: item.product,
    quantity: item.quantity,
    variant: item.variant,
    price: item.price,
  }));

  useCartStore.getState().mergeItems(newItems);
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();
  useBackButton();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderDetail(Number(orderId)),
    enabled: !!orderId,
  });

  const handleReorder = () => {
    if (!order) return;
    addOrderItemsToCart(order);
    haptic.notification('success');
    showToast('success', "Mahsulotlar savatga qo'shildi");
    navigate('/cart');
  };

  // Header — same back-chevron + title treatment as Orders.tsx, so this
  // detail screen isn't a dead end for a plain-browser visitor: Telegram's
  // native BackButton (useBackButton above) covers the in-app case, but the
  // app must also work with no Telegram bridge at all.
  const backButton = (
    <button
      aria-label="Orqaga"
      className="shrink-0 w-9 h-9 flex items-center justify-center press-effect"
      onClick={() => navigate(-1)}
      style={{ color: 'var(--tg-theme-text-color)' }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  if (isLoading) {
    return (
      <PageLayout showSearch={false}>
        <div className="px-4 py-4 flex items-center gap-3" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
          {backButton}
        </div>
        <Spinner className="py-20" />
      </PageLayout>
    );
  }

  if (!order) return null;

  const currentStatus = getStatusConfig(order.status);
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <PageLayout showSearch={false}>
      <div className="pb-8" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
        {/* Header */}
        <div className="px-4 py-4 flex items-center gap-3" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
          {backButton}
          <div className="flex-1 flex items-center justify-between min-w-0 gap-2">
            <h1 className="text-[17px] font-bold truncate" style={{ color: 'var(--tg-theme-text-color)' }}>
              Buyurtma #{order.number}
            </h1>
            <span
              className="shrink-0 text-[11px] font-semibold px-2.5 py-1"
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
                  const config = getStatusConfig(status);
                  const trackEntry = order.tracking?.find((tr) => tr.status === status);
                  // The backend seeds a tracking row for every status up front,
                  // including ones not yet reached — those carry a zero/epoch
                  // timestamp rather than omitting the field, which would
                  // otherwise format as "1-yan 06:00". Only a completed step's
                  // timestamp is real, and even then it must actually parse to
                  // a date after the epoch.
                  const trackTimestamp = trackEntry?.timestamp;
                  const hasRealTimestamp =
                    isCompleted && !!trackTimestamp && new Date(trackTimestamp).getTime() > 0;

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
                        {hasRealTimestamp && trackTimestamp && (
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--tg-theme-hint-color)' }}>
                            {formatDateTime(trackTimestamp)}
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
        {order.status === 'shipped' && order.tracking && (() => {
          const deliveryTrack = order.tracking.find((tr) => tr.status === 'shipped');
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
              {order.items.map((item) => {
                // product_snapshot.slug is always null from the backend — a row
                // without a real slug cannot link anywhere, so it must not look
                // or behave like it can be tapped.
                const hasProductLink = Boolean(item.product.slug);
                return (
                  <div
                    key={item.id}
                    className={`storex-card flex gap-3 p-3 ${hasProductLink ? 'press-effect cursor-pointer' : ''}`}
                    onClick={hasProductLink ? () => navigate(`/product/${item.product.slug}`) : undefined}
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
                );
              })}
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
                    {formatAddressLine(order.shipping_address)}
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
                {getPaymentMethodLabel(order.payment_method)}
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
            onClick={handleReorder}
          >
            Qayta buyurtma berish
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
    </PageLayout>
  );
}

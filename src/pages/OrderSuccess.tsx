import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderDetail } from '@/api/storefront';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  /**
   * The route param is the internal numeric `order.id` — `/orders/:orderId`
   * loads by it, so it has to stay in the URL. But it is not what the shopper
   * sees anywhere else: Orders and OrderDetail both print `order.number`
   * (`#ORD-001-260815-4456`), and the checkout response only carries the id.
   * Fetch the order to show the same identifier. Same `queryKey` as
   * OrderDetail, so "Buyurtmani ko'rish" renders from cache.
   */
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderDetail(Number(orderId)),
    enabled: !!orderId,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <span className="text-6xl mb-4">🎉</span>
      <h1 className="text-[20px] font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
        Buyurtma qabul qilindi!
      </h1>
      {isLoading ? (
        <Skeleton className="h-5 w-56 mb-6 rounded-(--storex-radius-sm)" />
      ) : (
        <p className="text-sm mb-6 text-center" style={{ color: 'var(--tg-theme-hint-color)' }}>
          {/* No number yet (request failed) → confirm the order without
              leaking the internal id the shopper cannot use anywhere. */}
          {order
            ? `Buyurtma #${order.number} muvaffaqiyatli yaratildi`
            : 'Buyurtmangiz muvaffaqiyatli yaratildi'}
        </p>
      )}
      <div className="flex gap-3">
        <button
          className="px-6 py-2.5 rounded-[12px] text-sm font-medium"
          style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
          onClick={() => navigate(`/orders/${orderId}`)}
        >
          Buyurtmani ko'rish
        </button>
        <button
          className="px-6 py-2.5 rounded-[12px] text-sm font-medium"
          style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          onClick={() => navigate('/')}
        >
          Bosh sahifa
        </button>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import { useMainButton } from '@/hooks/useMainButton';
import { useHaptic } from '@/hooks/useHaptic';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice } from '@/lib/format';
import { applyPromoCode, removePromoCode as removePromoApi } from '@/api/storefront';

export default function Cart() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const discount = useCartStore((s) => s.discount);
  const deliveryCost = useCartStore((s) => s.deliveryCost);
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const removePromoCode = useCartStore((s) => s.removePromoCode);

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const promoMutation = useMutation({
    mutationFn: (code: string) => applyPromoCode(code),
    onSuccess: (data) => {
      setPromoCode(data.promo.code, data.promo.discount_amount);
      setPromoMessage({ type: 'success', text: `Chegirma qo'llandi: -${data.promo.discount_percent}%` });
      setPromoInput('');
      haptic.notification('success');
    },
    onError: () => {
      setPromoMessage({ type: 'error', text: 'Promo-kod noto\'g\'ri yoki muddati o\'tgan' });
      haptic.notification('error');
    },
  });

  const removePromoMutation = useMutation({
    mutationFn: () => removePromoApi(),
    onSuccess: () => {
      removePromoCode();
      setPromoMessage(null);
      haptic.impact('light');
    },
  });

  const handleCheckout = useCallback(() => {
    haptic.impact('medium');
    navigate('/checkout');
  }, [haptic, navigate]);

  useMainButton({
    text: items.length > 0 ? `Buyurtma berish — ${formatPrice(total())}` : undefined,
    isVisible: items.length > 0,
    onClick: handleCheckout,
  });

  if (items.length === 0) {
    return (
      <PageLayout showSearch={false}>
        <EmptyState
          icon="🛒"
          title="Savat bo'sh"
          description="Mahsulotlarni ko'rib chiqing"
          action={{ label: "Katalogga o'tish", onClick: () => navigate('/catalog') }}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout showSearch={false}>
      <div className="px-4 py-4 pb-20">
        {/* Cart items */}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 rounded-[12px]"
              style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
            >
              <div
                className="w-16 h-16 rounded-[8px] overflow-hidden shrink-0 cursor-pointer"
                style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
                onClick={() => navigate(`/product/${item.product.slug}`)}
              >
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">📷</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm line-clamp-1 cursor-pointer"
                  style={{ color: 'var(--tg-theme-text-color)' }}
                  onClick={() => navigate(`/product/${item.product.slug}`)}
                >
                  {item.product.name}
                </p>
                {item.variant && (
                  <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {item.variant.name}
                  </p>
                )}
                <p className="text-sm font-semibold mt-1" style={{ color: 'var(--tg-theme-text-color)' }}>
                  {formatPrice(item.price * item.quantity)}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)' }}
                    onClick={() => {
                      haptic.impact('light');
                      updateQuantity(item.id, item.quantity - 1);
                    }}
                  >
                    −
                  </button>
                  <span className="text-sm font-medium w-4 text-center" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {item.quantity}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)' }}
                    onClick={() => {
                      haptic.impact('light');
                      updateQuantity(item.id, item.quantity + 1);
                    }}
                  >
                    +
                  </button>

                  <button
                    className="ml-auto text-sm"
                    style={{ color: 'var(--tg-theme-destructive-text-color, #e53e3e)' }}
                    onClick={() => {
                      haptic.notification('warning');
                      removeItem(item.id);
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--tg-theme-secondary-bg-color)' }}>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
            🎟 Promo-kod
          </p>
          {promoCode ? (
            <div className="flex items-center justify-between p-3 rounded-[12px]" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>{promoCode}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--store-success)' }}>✅ Qo'llandi</span>
              </div>
              <button
                className="text-xs"
                style={{ color: 'var(--tg-theme-destructive-text-color, #e53e3e)' }}
                onClick={() => removePromoMutation.mutate()}
              >
                Olib tashlash
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Kodni kiriting"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className="flex-1 h-10 px-3 rounded-[8px] text-sm outline-none"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                }}
              />
              <button
                className="px-4 h-10 rounded-[8px] text-sm font-medium"
                style={{
                  backgroundColor: 'var(--tg-theme-button-color)',
                  color: 'var(--tg-theme-button-text-color)',
                  opacity: promoInput.length < 2 || promoMutation.isPending ? 0.5 : 1,
                }}
                disabled={promoInput.length < 2 || promoMutation.isPending}
                onClick={() => promoMutation.mutate(promoInput)}
              >
                {promoMutation.isPending ? '...' : 'OK'}
              </button>
            </div>
          )}
          {promoMessage && (
            <p
              className="text-xs mt-2"
              style={{ color: promoMessage.type === 'success' ? 'var(--store-success)' : 'var(--store-price-sale)' }}
            >
              {promoMessage.text}
            </p>
          )}
        </div>

        {/* Price breakdown */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--tg-theme-secondary-bg-color)' }}>
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>Mahsulotlar ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>{formatPrice(subtotal())}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--tg-theme-hint-color)' }}>Chegirma</span>
              <span style={{ color: 'var(--store-price-sale)' }}>-{formatPrice(discount)}</span>
            </div>
          )}
          {deliveryCost > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--tg-theme-hint-color)' }}>Yetkazib berish</span>
              <span style={{ color: 'var(--tg-theme-text-color)' }}>{formatPrice(deliveryCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-[16px] font-semibold pt-2" style={{ borderTop: '1px solid var(--tg-theme-secondary-bg-color)' }}>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>Jami</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>{formatPrice(total())}</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

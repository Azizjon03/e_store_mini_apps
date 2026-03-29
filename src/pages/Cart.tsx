import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import { useMainButton } from '@/hooks/useMainButton';
import { useHaptic } from '@/hooks/useHaptic';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice, t } from '@/lib/format';
import { applyPromoCode, removePromoCode as removePromoApi, getCart } from '@/api/storefront';

export default function Cart() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const discount = useCartStore((s) => s.discount);
  const deliveryCost = useCartStore((s) => s.deliveryCost);
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const removePromoCode = useCartStore((s) => s.removePromoCode);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: items.length > 0,
  });

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
    text: items.length > 0 ? `Buyurtma berish · ${formatPrice(total())}` : undefined,
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
          action={{ label: "Xarid qilish", onClick: () => navigate('/catalog') }}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout showSearch={false}>
      <div className="px-4 py-4 pb-20 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
            Savat
          </h1>
          <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {items.reduce((s, i) => s + i.quantity, 0)} ta mahsulot
          </span>
        </div>

        {/* Cart items */}
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3"
              style={{
                backgroundColor: 'var(--tg-theme-bg-color)',
                borderRadius: 'var(--storex-radius-md)',
                border: 'var(--storex-border-card)',
                boxShadow: 'var(--storex-shadow-sm)',
              }}
            >
              <div
                className="w-18 h-18 shrink-0 overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  borderRadius: 'var(--storex-radius-sm)',
                }}
                onClick={() => navigate(`/product/${item.product.slug}`)}
              >
                {item.product.image ? (
                  <img src={item.product.image} alt={t(item.product.name)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--tg-theme-hint-color)" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col">
                <p
                  className="text-[13px] font-medium line-clamp-2 cursor-pointer leading-tight"
                  style={{ color: 'var(--tg-theme-text-color)' }}
                  onClick={() => navigate(`/product/${item.product.slug}`)}
                >
                  {t(item.product.name)}
                </p>
                {item.variant && (
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {item.variant.name}
                  </p>
                )}
                <p className="text-[15px] font-bold mt-auto" style={{ color: 'var(--tg-theme-text-color)' }}>
                  {formatPrice(item.price * item.quantity)}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  {/* Quantity controls */}
                  <div
                    className="flex items-center overflow-hidden"
                    style={{
                      borderRadius: 'var(--storex-radius-sm)',
                      border: '1px solid var(--storex-border)',
                    }}
                  >
                    <button
                      className="w-8 h-7 flex items-center justify-center text-sm font-bold active:opacity-60"
                      style={{ color: item.quantity === 1 ? 'var(--storex-danger)' : 'var(--storex-primary)' }}
                      onClick={() => {
                        haptic.impact('light');
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                    >
                      {item.quantity === 1 ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      ) : '−'}
                    </button>
                    <span
                      className="w-7 text-center text-sm font-semibold"
                      style={{ color: 'var(--tg-theme-text-color)' }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      className="w-8 h-7 flex items-center justify-center text-sm font-bold active:opacity-60"
                      style={{ color: 'var(--storex-primary)' }}
                      onClick={() => {
                        haptic.impact('light');
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div
          className="mt-4 p-3"
          style={{
            backgroundColor: 'var(--tg-theme-bg-color)',
            borderRadius: 'var(--storex-radius-md)',
            border: 'var(--storex-border-card)',
                boxShadow: 'var(--storex-shadow-sm)',
          }}
        >
          {promoCode ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--storex-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>{promoCode}</span>
              </div>
              <button
                className="text-xs font-medium"
                style={{ color: 'var(--storex-danger)' }}
                onClick={() => removePromoMutation.mutate()}
              >
                Olib tashlash
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo kod kiriting"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className="flex-1 h-10 px-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                  borderRadius: 'var(--storex-radius-sm)',
                }}
              />
              <button
                className="px-4 h-10 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--storex-primary)',
                  color: '#fff',
                  borderRadius: 'var(--storex-radius-sm)',
                  opacity: promoInput.length < 2 || promoMutation.isPending ? 0.5 : 1,
                }}
                disabled={promoInput.length < 2 || promoMutation.isPending}
                onClick={() => promoMutation.mutate(promoInput)}
              >
                Qo'llash
              </button>
            </div>
          )}
          {promoMessage && (
            <p
              className="text-xs mt-2 font-medium"
              style={{ color: promoMessage.type === 'success' ? 'var(--storex-success)' : 'var(--storex-danger)' }}
            >
              {promoMessage.text}
            </p>
          )}
        </div>

        {/* Free delivery progress & estimated delivery */}
        {cartData?.free_delivery_remaining != null && cartData.free_delivery_remaining > 0 && (
          <div
            className="mt-4 p-3 flex items-center gap-2"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--storex-primary) 8%, var(--tg-theme-bg-color))',
              borderRadius: 'var(--storex-radius-md)',
              border: '1px solid color-mix(in srgb, var(--storex-primary) 20%, transparent)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--storex-primary)', flexShrink: 0 }}>
              <path d="M1 3h11v9H1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M12 7h3l3 3v2h-6V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <circle cx="5" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="15" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span className="text-[13px]" style={{ color: 'var(--storex-primary)' }}>
              Bepul yetkazish uchun yana {formatPrice(cartData.free_delivery_remaining)} xarid qiling
            </span>
          </div>
        )}
        {cartData?.estimated_delivery && (
          <div
            className="mt-2 p-3 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--tg-theme-bg-color)',
              borderRadius: 'var(--storex-radius-md)',
              border: 'var(--storex-border-card)',
                boxShadow: 'var(--storex-shadow-sm)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--tg-theme-hint-color)', flexShrink: 0 }}>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 4v4l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-[13px]" style={{ color: 'var(--tg-theme-text-color)' }}>
              {cartData.estimated_delivery}
            </span>
          </div>
        )}

        {/* Price breakdown */}
        <div
          className="mt-4 p-4"
          style={{
            backgroundColor: 'var(--tg-theme-bg-color)',
            borderRadius: 'var(--storex-radius-md)',
            border: 'var(--storex-border-card)',
                boxShadow: 'var(--storex-shadow-sm)',
          }}
        >
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>
              Jami mahsulotlar
            </span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>{formatPrice(subtotal())}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--tg-theme-hint-color)' }}>Chegirma</span>
              <span className="font-medium" style={{ color: 'var(--storex-danger)' }}>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>Yetkazib berish</span>
            <span style={{ color: deliveryCost === 0 ? 'var(--storex-success)' : 'var(--tg-theme-text-color)' }}>
              {deliveryCost === 0 ? 'Bepul' : formatPrice(deliveryCost)}
            </span>
          </div>
          <div
            className="flex justify-between pt-3 mt-2"
            style={{ borderTop: '1px solid var(--storex-border)' }}
          >
            <span className="text-base font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>Jami</span>
            <span className="text-lg font-bold" style={{ color: 'var(--storex-primary)' }}>{formatPrice(total())}</span>
          </div>
        </div>

        {/* Bottom checkout button (fallback for non-Telegram) */}
        <button
          className="w-full mt-4 py-3.5 text-[15px] font-bold press-effect"
          style={{
            backgroundColor: 'var(--storex-primary)',
            color: '#fff',
            borderRadius: 'var(--storex-radius-md)',
          }}
          onClick={handleCheckout}
        >
          Buyurtma berish · {formatPrice(total())}
        </button>
      </div>
    </PageLayout>
  );
}

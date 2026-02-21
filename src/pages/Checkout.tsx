import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAddresses, checkout } from '@/api/storefront';
import { useCartStore } from '@/store/cartStore';
import { useMainButton } from '@/hooks/useMainButton';
import { useHaptic } from '@/hooks/useHaptic';
import { formatPrice } from '@/lib/format';
import { showToast } from '@/lib/toast';
import { Spinner } from '@/components/ui/Spinner';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';

type DeliveryMethod = 'delivery' | 'pickup';
type PaymentMethod = 'click' | 'payme' | 'cash';

export default function Checkout() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const discount = useCartStore((s) => s.discount);
  const promoCode = useCartStore((s) => s.promoCode);
  const deliveryCost = useCartStore((s) => s.deliveryCost);
  const setDeliveryCost = useCartStore((s) => s.setDeliveryCost);
  const clear = useCartStore((s) => s.clear);

  const [userSelectedAddress, setUserSelectedAddress] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('click');
  const [notes, setNotes] = useState('');

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  // Derived: auto-select primary address if user hasn't chosen
  const defaultAddress = addresses && addresses.length > 0
    ? (addresses.find((a) => a.is_primary)?.id ?? addresses[0].id)
    : null;
  const selectedAddress = userSelectedAddress ?? defaultAddress;

  // Update delivery cost based on method
  const handleDeliveryChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    setDeliveryCost(method === 'delivery' ? 15000 : 0);
    haptic.selectionChanged();
  };

  const checkoutMutation = useMutation({
    mutationFn: () => {
      if (selectedAddress === null) throw new Error('No address selected');
      return checkout({
        address_id: selectedAddress,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        notes: notes || undefined,
        promo_code: promoCode ?? undefined,
      });
    },
    onSuccess: (data) => {
      haptic.impact('heavy');
      clear();
      if (data.payment_url && paymentMethod !== 'cash') {
        if (isTelegramWebApp) {
          WebApp.openLink(data.payment_url);
        } else {
          window.open(data.payment_url, '_blank');
        }
      }
      navigate(`/order-success/${data.order.id}`);
    },
    onError: () => {
      showToast('error', "Xatolik yuz berdi. Qayta urinib ko'ring.");
      haptic.notification('error');
    },
  });

  const canSubmit = selectedAddress !== null && items.length > 0 && !checkoutMutation.isPending;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    checkoutMutation.mutate();
  }, [canSubmit, checkoutMutation]);

  useMainButton({
    text: `To'lash — ${formatPrice(total())}`,
    isVisible: true,
    isActive: canSubmit,
    isLoading: checkoutMutation.isPending,
    onClick: handleSubmit,
  });

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <div className="px-4 py-4">
        {/* Step 1: Address */}
        <section className="mb-6">
          <h3 className="text-[16px] font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--tg-theme-text-color)' }}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}>1</span>
            Yetkazish manzili
          </h3>

          {addressesLoading ? (
            <Spinner className="py-4" />
          ) : addresses && addresses.length > 0 ? (
            <div className="flex flex-col gap-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  className="flex items-start gap-3 p-3 rounded-xl text-left w-full transition-all"
                  style={{
                    backgroundColor: selectedAddress === addr.id
                      ? 'var(--tg-theme-secondary-bg-color)'
                      : 'transparent',
                    border: selectedAddress === addr.id
                      ? '1.5px solid var(--tg-theme-button-color)'
                      : '1.5px solid var(--tg-theme-secondary-bg-color)',
                  }}
                  onClick={() => {
                    setUserSelectedAddress(addr.id);
                    haptic.selectionChanged();
                  }}
                >
                  <span className="mt-0.5">📍</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                      {addr.label} {addr.is_primary && <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>(asosiy)</span>}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      {addr.city}, {addr.district}, {addr.full_address}
                    </p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1"
                    style={{ borderColor: selectedAddress === addr.id ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)' }}
                  >
                    {selectedAddress === addr.id && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--tg-theme-button-color)' }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
          <button
            className="mt-2 text-sm font-medium"
            style={{ color: 'var(--tg-theme-link-color)' }}
            onClick={() => navigate('/profile/addresses/new')}
          >
            + Yangi manzil qo'shish
          </button>
        </section>

        <hr style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Step 2: Delivery method */}
        <section className="my-6">
          <h3 className="text-[16px] font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--tg-theme-text-color)' }}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}>2</span>
            Yetkazish usuli
          </h3>
          <div className="flex flex-col gap-2">
            {([
              { value: 'delivery' as const, icon: '🚚', label: 'Yetkazib berish', desc: "1-2 kun, 15,000 so'm" },
              { value: 'pickup' as const, icon: '🏪', label: "O'zi olib ketish", desc: 'Bepul' },
            ]).map((opt) => (
              <button
                key={opt.value}
                className="flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all"
                style={{
                  backgroundColor: deliveryMethod === opt.value
                    ? 'var(--tg-theme-secondary-bg-color)'
                    : 'transparent',
                  border: deliveryMethod === opt.value
                    ? '1.5px solid var(--tg-theme-button-color)'
                    : '1.5px solid var(--tg-theme-secondary-bg-color)',
                }}
                onClick={() => handleDeliveryChange(opt.value)}
              >
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>{opt.label}</p>
                  <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>{opt.desc}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: deliveryMethod === opt.value ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)' }}
                >
                  {deliveryMethod === opt.value && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--tg-theme-button-color)' }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        <hr style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Step 3: Payment method */}
        <section className="my-6">
          <h3 className="text-[16px] font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--tg-theme-text-color)' }}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}>3</span>
            To'lov usuli
          </h3>
          <div className="flex flex-col gap-2">
            {([
              { value: 'click' as const, icon: '💳', label: 'Click', desc: "Online to'lov" },
              { value: 'payme' as const, icon: '💳', label: 'Payme', desc: "Online to'lov" },
              { value: 'cash' as const, icon: '💵', label: "Naqd to'lov", desc: 'Yetkazib berishda' },
            ]).map((opt) => (
              <button
                key={opt.value}
                className="flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all"
                style={{
                  backgroundColor: paymentMethod === opt.value
                    ? 'var(--tg-theme-secondary-bg-color)'
                    : 'transparent',
                  border: paymentMethod === opt.value
                    ? '1.5px solid var(--tg-theme-button-color)'
                    : '1.5px solid var(--tg-theme-secondary-bg-color)',
                }}
                onClick={() => {
                  setPaymentMethod(opt.value);
                  haptic.selectionChanged();
                }}
              >
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>{opt.label}</p>
                  <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>{opt.desc}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: paymentMethod === opt.value ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)' }}
                >
                  {paymentMethod === opt.value && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--tg-theme-button-color)' }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        <hr style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Notes */}
        <section className="my-6">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
            📝 Izoh (ixtiyoriy)
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Qo'ng'iroq qilmang..."
            maxLength={500}
            rows={3}
            className="w-full p-3 rounded-xl text-sm outline-none resize-none"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
            }}
          />
        </section>

        <hr style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Order summary */}
        <section className="mt-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
            Buyurtma xulosasi
          </h3>
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
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>Yetkazib berish</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>
              {deliveryCost > 0 ? formatPrice(deliveryCost) : 'Bepul'}
            </span>
          </div>
          <div className="flex justify-between text-[16px] font-semibold pt-2" style={{ borderTop: '1px solid var(--tg-theme-secondary-bg-color)' }}>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>Jami</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>{formatPrice(total())}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

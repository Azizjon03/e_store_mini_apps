import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAddresses, checkout, getDeliverySlots, getPaymentMethods } from '@/api/storefront';
import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
import { useMainButton } from '@/hooks/useMainButton';
import { useBackButton } from '@/hooks/useBackButton';
import { useHaptic } from '@/hooks/useHaptic';
import { formatPrice, t } from '@/lib/format';
import { showToast } from '@/lib/toast';
import { Spinner } from '@/components/ui/Spinner';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';

type DeliveryMethod = 'delivery' | 'pickup';

const STEPS = [
  { key: 'address', label: 'Manzil' },
  { key: 'delivery', label: 'Yetkazish' },
  { key: 'payment', label: "To'lov" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  useBackButton();

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const discount = useCartStore((s) => s.discount);
  const promoCode = useCartStore((s) => s.promoCode);
  const deliveryCost = useCartStore((s) => s.deliveryCost);
  const setDeliveryCost = useCartStore((s) => s.setDeliveryCost);
  const clear = useCartStore((s) => s.clear);

  const storeConfig = useAppStore((s) => s.storeConfig);

  const [userSelectedAddress, setUserSelectedAddress] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<string>('click');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [showItems, setShowItems] = useState(false);

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const { data: deliverySlots } = useQuery({
    queryKey: ['delivery-slots'],
    queryFn: getDeliverySlots,
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
  });

  // Derived: auto-select primary address if user hasn't chosen
  const defaultAddress = addresses && addresses.length > 0
    ? (addresses.find((a) => a.is_primary)?.id ?? addresses[0].id)
    : null;
  const selectedAddress = userSelectedAddress ?? defaultAddress;

  // Determine current step for progress bar
  const currentStep = selectedAddress ? (deliveryMethod ? 2 : 1) : 0;

  const configDeliveryCost = storeConfig?.delivery_info?.delivery_cost ?? 15000;

  // Update delivery cost based on method
  const handleDeliveryChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    setDeliveryCost(method === 'delivery' ? configDeliveryCost : 0);
    haptic.selectionChanged();
  };

  const checkoutMutation = useMutation({
    mutationFn: () => {
      if (selectedAddress === null) throw new Error('No address selected');
      return checkout({
        address_id: selectedAddress,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        delivery_slot_id: selectedSlotId ?? undefined,
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
    text: `To'lovga o'tish - ${formatPrice(total())}`,
    isVisible: true,
    isActive: canSubmit,
    isLoading: checkoutMutation.isPending,
    onClick: handleSubmit,
  });

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
      {/* Step Progress Bar */}
      <div className="px-4 pt-4 pb-3" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center" style={{ flex: index < STEPS.length - 1 ? 1 : 'none' }}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
                  style={{
                    backgroundColor: index <= currentStep ? 'var(--storex-primary)' : 'var(--tg-theme-secondary-bg-color)',
                    color: index <= currentStep ? '#fff' : 'var(--tg-theme-hint-color)',
                  }}
                >
                  {index < currentStep ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7l2.5 2.5L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: index <= currentStep ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)' }}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 -mt-4"
                  style={{
                    backgroundColor: index < currentStep ? 'var(--storex-primary)' : 'var(--storex-border)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Address */}
      <div className="storex-divider" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <div className="storex-section-header" style={{ padding: 0, marginBottom: 12 }}>
            <span className="storex-section-title" style={{ fontSize: 15 }}>Yetkazish manzili</span>
            <button
              className="storex-section-link"
              onClick={() => navigate('/profile/addresses')}
            >
              Tahrirlash
            </button>
          </div>

          {addressesLoading ? (
            <Spinner className="py-4" />
          ) : addresses && addresses.length > 0 ? (
            <div className="flex flex-col gap-2">
              {addresses.map((addr) => {
                const isSelected = selectedAddress === addr.id;
                return (
                  <button
                    key={addr.id}
                    className="storex-card press-effect flex items-start gap-3 p-3 text-left w-full"
                    style={{
                      border: isSelected
                        ? '1.5px solid var(--storex-primary)'
                        : '1.5px solid var(--storex-border)',
                    }}
                    onClick={() => {
                      setUserSelectedAddress(addr.id);
                      haptic.selectionChanged();
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5" style={{ color: 'var(--storex-primary)' }}>
                      <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.5 5.5 9.5 5.5 9.5s5.5-5 5.5-9.5c0-3.04-2.46-5.5-5.5-5.5z" fill="currentColor" opacity="0.15" />
                      <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7c0 4.5 5.5 9.5 5.5 9.5s5.5-5 5.5-9.5c0-3.04-2.46-5.5-5.5-5.5z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="9" cy="7" r="2" fill="currentColor" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                        {addr.label} {addr.is_primary && <span className="text-[11px]" style={{ color: 'var(--tg-theme-hint-color)' }}>(asosiy)</span>}
                      </p>
                      <p className="text-[13px] mt-0.5 line-clamp-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                        {addr.city}, {addr.district}, {addr.full_address}
                      </p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1"
                      style={{ borderColor: isSelected ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)' }}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--storex-primary)' }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className="storex-card p-4 text-center"
              style={{ border: '1px dashed var(--storex-border)' }}
            >
              <p className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Manzil topilmadi
              </p>
            </div>
          )}
          <button
            className="mt-3 text-[13px] font-medium"
            style={{ color: 'var(--storex-primary)' }}
            onClick={() => navigate('/profile/addresses/new')}
          >
            + Yangi manzil qo'shish
          </button>
        </div>
      </section>

      {/* Step 2: Delivery method */}
      <div className="storex-divider" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
            Yetkazish usuli
          </p>
          <div className="flex flex-col gap-2">
            {([
              {
                value: 'delivery' as const,
                label: 'Kuryer orqali yetkazish',
                desc: `1-2 kun, ${formatPrice(configDeliveryCost)}`,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M1 3h11v9H1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M12 7h3l3 3v2h-6V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <circle cx="5" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="15" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                ),
              },
              {
                value: 'pickup' as const,
                label: "O'zi olib ketish",
                desc: 'Bepul',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 7l7-4 7 4v8l-7 4-7-4V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M3 7l7 4m0 0l7-4m-7 4v8" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                ),
              },
            ]).map((opt) => {
              const isSelected = deliveryMethod === opt.value;
              return (
                <button
                  key={opt.value}
                  className="storex-card press-effect flex items-center gap-3 p-3 w-full text-left"
                  style={{
                    border: isSelected
                      ? '1.5px solid var(--storex-primary)'
                      : '1.5px solid var(--storex-border)',
                    color: isSelected ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)',
                  }}
                  onClick={() => handleDeliveryChange(opt.value)}
                >
                  <span style={{ color: isSelected ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)' }}>
                    {opt.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-[15px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>{opt.label}</p>
                    <p className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>{opt.desc}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: isSelected ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)' }}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--storex-primary)' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Delivery time slots */}
          {deliveryMethod === 'delivery' && deliverySlots && (
            <div className="mt-3">
              {deliverySlots.today && deliverySlots.today.length > 0 && (
                <>
                  <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
                    Bugun
                  </p>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {deliverySlots.today.map((slot) => (
                      <button
                        key={slot.id}
                        className={`storex-chip ${selectedSlotId === slot.id ? 'active' : ''}`}
                        disabled={!slot.available}
                        style={{ opacity: slot.available ? 1 : 0.4 }}
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          haptic.selectionChanged();
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {deliverySlots.tomorrow && deliverySlots.tomorrow.length > 0 && (
                <>
                  <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
                    Ertaga
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {deliverySlots.tomorrow.map((slot) => (
                      <button
                        key={slot.id}
                        className={`storex-chip ${selectedSlotId === slot.id ? 'active' : ''}`}
                        disabled={!slot.available}
                        style={{ opacity: slot.available ? 1 : 0.4 }}
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          haptic.selectionChanged();
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Step 3: Payment method */}
      <div className="storex-divider" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
            To'lov usuli
          </p>
          <div className="flex flex-col gap-2">
            {(paymentMethods ?? []).filter((m) => m.available).map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  className="storex-card press-effect flex items-center gap-3 p-3 w-full text-left"
                  style={{
                    border: isSelected
                      ? '1.5px solid var(--storex-primary)'
                      : '1.5px solid var(--storex-border)',
                    color: isSelected ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)',
                  }}
                  onClick={() => {
                    setPaymentMethod(method.id);
                    haptic.selectionChanged();
                  }}
                >
                  <PaymentIcon methodId={method.id} isSelected={isSelected} />
                  <div className="flex-1">
                    <p className="text-[15px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>{method.name}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: isSelected ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)' }}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--storex-primary)' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Order items preview (collapsible) */}
      <div className="storex-divider" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowItems(!showItems)}
          >
            <span className="text-[15px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
              Buyurtma tarkibi ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{
                color: 'var(--tg-theme-hint-color)',
                transform: showItems ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
              }}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showItems && (
            <div className="mt-3 flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 overflow-hidden shrink-0"
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
                          <circle cx="5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1" />
                          <path d="M1 11l3.5-3 3 2.5L11 7l4 4.5V13a2 2 0 01-2 2H3a2 2 0 01-2-2v-2z" fill="currentColor" opacity="0.15" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] line-clamp-1" style={{ color: 'var(--tg-theme-text-color)' }}>
                      {t(item.product.name)}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comment */}
      <div className="storex-divider" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <p className="text-[15px] font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
            Izoh (ixtiyoriy)
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Qo'ng'iroq qilmang, eshik oldiga qo'ying..."
            maxLength={500}
            rows={3}
            className="w-full p-3 text-[13px] outline-none resize-none"
            style={{
              borderRadius: 'var(--storex-radius-md)',
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
              border: '1px solid var(--storex-border)',
            }}
          />
        </div>
      </section>

      {/* Price summary */}
      <div className="storex-divider" />
      <section style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div className="px-4 py-3">
          <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
            Buyurtma xulosasi
          </p>
          <div className="flex justify-between text-[13px] mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>
              Mahsulotlar ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>{formatPrice(subtotal())}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[13px] mb-2">
              <span style={{ color: 'var(--tg-theme-hint-color)' }}>Chegirma</span>
              <span style={{ color: 'var(--storex-danger)' }}>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[13px] mb-2">
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>Yetkazib berish</span>
            <span style={{ color: 'var(--tg-theme-text-color)' }}>
              {deliveryCost > 0 ? formatPrice(deliveryCost) : 'Bepul'}
            </span>
          </div>
          <div
            className="flex justify-between text-[17px] font-bold pt-3 mt-2"
            style={{ borderTop: '1px solid var(--storex-border)' }}
          >
            <span style={{ color: 'var(--tg-theme-text-color)' }}>Jami</span>
            <span style={{ color: 'var(--storex-primary)' }}>{formatPrice(total())}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function PaymentIcon({ methodId, isSelected }: { methodId: string; isSelected: boolean }) {
  const color = isSelected ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)';
  if (methodId === 'cash') {
    return (
      <span style={{ color }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="5" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M4 7.5v5M16 7.5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span style={{ color }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 8h16" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

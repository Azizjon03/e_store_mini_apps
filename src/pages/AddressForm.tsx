import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddresses, createAddress, updateAddress } from '@/api/storefront';
import { useMainButton } from '@/hooks/useMainButton';
import { useHaptic } from '@/hooks/useHaptic';
import { showToast } from '@/lib/toast';
import type { Address } from '@/api/types';

const LABELS = ['Uy', 'Ish', 'Boshqa'];

export default function AddressForm() {
  const { addressId } = useParams<{ addressId: string }>();
  const isEdit = !!addressId;

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: isEdit,
  });

  const existing = addresses?.find((a) => a.id === Number(addressId));

  // Show loading while fetching existing data in edit mode
  if (isEdit && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>Yuklanmoqda...</span>
      </div>
    );
  }

  // key forces remount when existing data loads, so useState gets correct initial values
  return <AddressFormFields key={existing?.id ?? 'new'} existing={existing} isEdit={isEdit} addressId={addressId} />;
}

function AddressFormFields({ existing, isEdit, addressId }: {
  existing: Address | undefined;
  isEdit: boolean;
  addressId: string | undefined;
}) {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const queryClient = useQueryClient();

  const [label, setLabel] = useState(existing?.label ?? 'Uy');
  const [city, setCity] = useState(existing?.city ?? '');
  const [district, setDistrict] = useState(existing?.district ?? '');
  const [fullAddress, setFullAddress] = useState(existing?.full_address ?? '');
  const [landmark, setLandmark] = useState(existing?.landmark ?? '');
  const [isPrimary, setIsPrimary] = useState(existing?.is_primary ?? false);

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = {
        label,
        city,
        district,
        full_address: fullAddress,
        landmark: landmark || undefined,
        is_primary: isPrimary,
      };
      return isEdit
        ? updateAddress(Number(addressId), data)
        : createAddress(data as Parameters<typeof createAddress>[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast('success', isEdit ? 'Manzil yangilandi' : "Manzil qo'shildi");
      haptic.notification('success');
      navigate(-1);
    },
    onError: () => {
      showToast('error', 'Xatolik yuz berdi');
      haptic.notification('error');
    },
  });

  const isValid = city.trim() && district.trim() && fullAddress.trim();

  useMainButton({
    text: 'Saqlash',
    isVisible: true,
    isActive: !!isValid && !saveMutation.isPending,
    isLoading: saveMutation.isPending,
    onClick: () => {
      if (isValid) saveMutation.mutate();
    },
  });

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <div className="px-4 py-4 flex flex-col gap-5">
        {/* Label */}
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--tg-theme-text-color)' }}>
            Label
          </label>
          <div className="flex gap-2">
            {LABELS.map((l) => (
              <button
                key={l}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: label === l
                    ? 'var(--tg-theme-button-color)'
                    : 'var(--tg-theme-secondary-bg-color)',
                  color: label === l
                    ? 'var(--tg-theme-button-text-color)'
                    : 'var(--tg-theme-text-color)',
                }}
                onClick={() => {
                  setLabel(l);
                  haptic.selectionChanged();
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--tg-theme-text-color)' }}>
            Shahar *
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Toshkent"
            className="w-full h-11 px-3 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
            }}
          />
        </div>

        {/* District */}
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--tg-theme-text-color)' }}>
            Tuman *
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Chilonzor"
            className="w-full h-11 px-3 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
            }}
          />
        </div>

        {/* Full address */}
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--tg-theme-text-color)' }}>
            To'liq manzil *
          </label>
          <input
            type="text"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            placeholder="12-kvartal, 5-uy, 23-xonadon"
            className="w-full h-11 px-3 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
            }}
          />
        </div>

        {/* Landmark */}
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--tg-theme-text-color)' }}>
            Mo'ljal (ixtiyoriy)
          </label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="Metro yonida, yashil bino"
            className="w-full h-11 px-3 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
            }}
          />
        </div>

        {/* Is primary */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--tg-theme-text-color)' }}>
            Asosiy manzil qilish
          </span>
          <button
            className="w-12 h-7 rounded-full p-0.5 transition-colors duration-200"
            style={{
              backgroundColor: isPrimary
                ? 'var(--tg-theme-button-color)'
                : 'var(--tg-theme-hint-color, #ccc)',
            }}
            onClick={() => setIsPrimary(!isPrimary)}
          >
            <div
              className="w-6 h-6 rounded-full transition-transform duration-200"
              style={{
                backgroundColor: '#fff',
                transform: isPrimary ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

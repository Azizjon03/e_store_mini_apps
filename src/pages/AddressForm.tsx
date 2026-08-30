import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddresses, createAddress, updateAddress } from '@/api/storefront';
import { useHaptic } from '@/hooks/useHaptic';
import { showToast } from '@/lib/toast';
import { SubmitBar } from '@/components/ui/SubmitBar';
import { Chip } from '@/components/ui/Chip';
import { NetworkError } from '@/components/ui/NetworkError';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Address } from '@/api/types';

const LABELS = ['Uy', 'Ish', 'Boshqa'];

export default function AddressForm() {
  const { addressId } = useParams<{ addressId: string }>();
  const navigate = useNavigate();
  const isEdit = !!addressId;

  const { data: addresses, isLoading, isError, refetch } = useQuery({
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

  // Both branches below exist because an unresolved `existing` silently
  // turns the edit form into a *create* form: the fields render empty and
  // saving adds a second address instead of changing the one that was
  // opened. A failed request and a deleted address are different stories,
  // so they get different screens.
  if (isEdit && isError) {
    return <NetworkError onRetry={() => refetch()} />;
  }

  if (isEdit && !existing) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <EmptyState
          icon="📍"
          title="Manzil topilmadi"
          description="Bu manzil o'chirilgan bo'lishi mumkin."
          action={{ label: 'Manzillarga qaytish', onClick: () => navigate('/profile/addresses') }}
        />
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

  // `label` is free text on the backend (`nullable|string|max:50`), not an
  // enum — seeded/older rows carry values like "Ish joyi" or "Ofis" that
  // match none of the three canonical chips below. Appending the saved
  // value when it doesn't match keeps it visibly selected instead of
  // landing on no chip at all.
  const labelOptions = existing?.label && !LABELS.includes(existing.label)
    ? [...LABELS, existing.label]
    : LABELS;

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

  // Backend validation (POST/PUT /addresses) only marks `full_address` as
  // `required` — `label`, `city`, `district`, `landmark` are all
  // `nullable`. Gating submission on city/district being non-empty
  // disagreed with the server, and presented an existing address (whose
  // city/district come back as `""` from the seeded data) as a broken form
  // the user had to repair before saving anything else about it.
  const isValid = fullAddress.trim().length > 0;

  const handleSave = () => {
    if (isValid) saveMutation.mutate();
  };

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <div className="px-4 py-4 flex flex-col gap-5">
        {/* Label */}
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--tg-theme-text-color)' }}>
            Manzil nomi
          </label>
          <div className="flex gap-2 flex-wrap">
            {labelOptions.map((l) => (
              <Chip
                key={l}
                active={label === l}
                onClick={() => {
                  setLabel(l);
                  haptic.selectionChanged();
                }}
              >
                {l}
              </Chip>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--tg-theme-text-color)' }}>
            Shahar (ixtiyoriy)
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
            Tuman (ixtiyoriy)
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

      <SubmitBar
        text={isEdit ? 'Manzilni yangilash' : "Manzilni saqlash"}
        onClick={handleSave}
        disabled={!isValid}
        loading={saveMutation.isPending}
      />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddresses, deleteAddress } from '@/api/storefront';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHaptic } from '@/hooks/useHaptic';
import { showToast } from '@/lib/toast';
import { useTelegram } from '@/hooks/useTelegram';
import { formatAddressLine } from '@/lib/address';

export default function Addresses() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const { showConfirm } = useTelegram();
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast('success', "Manzil o'chirildi");
      haptic.notification('success');
    },
    onError: () => {
      showToast('error', 'Xatolik yuz berdi');
    },
  });

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm("Bu manzilni o'chirishni xohlaysizmi?");
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <PageLayout showSearch={false}>
      {/* Header — same back-chevron + title treatment as Orders.tsx. Reached
          from Profile's "Manzillarim" link; without this the screen had no
          title and no way back outside Telegram, where there's no native
          BackButton to fall back on. */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
      >
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
        <h1 className="text-[17px] font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
          Manzillarim
        </h1>
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !addresses || addresses.length === 0 ? (
          <EmptyState
            icon="📍"
            title="Manzillar yo'q"
            description="Yetkazish uchun manzil qo'shing"
            action={{ label: "Manzil qo'shish", onClick: () => navigate('/profile/addresses/new') }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                        📍 {addr.label}
                      </span>
                      {addr.is_primary && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}>
                          asosiy
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      {formatAddressLine(addr)}
                    </p>
                    {addr.landmark && (
                      <p className="text-xs mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                        Mo'ljal: {addr.landmark}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
                      style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
                      onClick={() => {
                        haptic.selectionChanged();
                        navigate(`/profile/addresses/${addr.id}`);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
                      style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
                      onClick={() => handleDelete(addr.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="w-full mt-4 py-3 rounded-xl text-sm font-medium"
          style={{
            border: '1.5px dashed var(--tg-theme-hint-color)',
            color: 'var(--tg-theme-link-color)',
            backgroundColor: 'transparent',
          }}
          onClick={() => navigate('/profile/addresses/new')}
        >
          + Yangi manzil qo'shish
        </button>
      </div>
    </PageLayout>
  );
}

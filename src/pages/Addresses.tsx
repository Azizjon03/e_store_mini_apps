import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddresses, deleteAddress } from '@/api/storefront';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHaptic } from '@/hooks/useHaptic';
import { showToast } from '@/lib/toast';
import { useTelegram } from '@/hooks/useTelegram';

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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
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
                      {addr.city}, {addr.district}, {addr.full_address}
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
    </div>
  );
}

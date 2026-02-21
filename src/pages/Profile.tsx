import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageLayout } from '@/components/layout/PageLayout';
import { useHaptic } from '@/hooks/useHaptic';

const menuItems = [
  { icon: '📦', label: 'Buyurtmalarim', path: '/orders' },
  { icon: '📍', label: 'Manzillarim', path: '/profile/addresses' },
  { icon: '❤️', label: 'Sevimlilar', path: '/favorites' },
];

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const haptic = useHaptic();

  return (
    <PageLayout showSearch={false}>
      <div className="px-4 py-4">
        {/* User info */}
        <div
          className="flex items-center gap-3 p-4 rounded-[12px] mb-4"
          style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          >
            {user?.first_name?.[0] ?? '👤'}
          </div>
          <div>
            <p className="text-[16px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
              {user?.first_name} {user?.last_name ?? ''}
            </p>
            {user?.username && (
              <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
                @{user.username}
              </p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="rounded-[12px] overflow-hidden" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              className="flex items-center w-full px-4 py-3.5 text-left"
              style={{
                borderBottom:
                  index < menuItems.length - 1
                    ? '0.5px solid var(--tg-theme-bg-color)'
                    : 'none',
                color: 'var(--tg-theme-text-color)',
              }}
              onClick={() => {
                haptic.selectionChanged();
                navigate(item.path);
              }}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1 text-sm">{item.label}</span>
              <span style={{ color: 'var(--tg-theme-hint-color)' }}>→</span>
            </button>
          ))}
        </div>

        {/* Version */}
        <p
          className="text-center text-xs mt-8"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          E-Store v1.0
        </p>
      </div>
    </PageLayout>
  );
}

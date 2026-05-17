import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getProfile } from '@/api/storefront';
import { PageLayout } from '@/components/layout/PageLayout';
import { useHaptic } from '@/hooks/useHaptic';

interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
}

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const haptic = useHaptic();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const fullName = user?.name || 'Foydalanuvchi';
  const phoneOrUsername = profile?.phone ?? user?.phone ?? '';

  const ordersGroup: MenuItem[] = [
    { icon: 'package_2', label: 'Buyurtmalarim', path: '/orders' },
    { icon: 'favorite', label: 'Sevimlilar', path: '/favorites' },
  ];

  const settingsGroup: MenuItem[] = [
    { icon: 'location_on', label: 'Manzillarim', path: '/profile/addresses' },
    {
      icon: 'language',
      label: 'Til',
      path: '/profile/language',
      trailing: (
        <span className="text-sm font-semibold" style={{ color: 'var(--stitch-primary)' }}>
          O'zbekcha
        </span>
      ),
    },
    {
      icon: 'notifications',
      label: 'Bildirishnomalar',
      trailing: (
        <Toggle
          on={notificationsOn}
          onChange={() => {
            haptic.selectionChanged();
            setNotificationsOn((v) => !v);
          }}
        />
      ),
    },
  ];

  const supportGroup: MenuItem[] = [
    { icon: 'chat_bubble', label: 'Yordam', path: '/support' },
    {
      icon: 'info',
      label: 'Ilova haqida',
      path: '/about',
      trailing: <VersionPill version="v1.0.0" />,
    },
  ];

  const handleLogout = () => {
    haptic.impact('medium');
    logout();
    navigate('/');
  };

  return (
    <PageLayout showSearch={false}>
      <div
        className="page-enter"
        style={{
          backgroundColor: 'var(--stitch-surface)',
          minHeight: 'calc(100vh - var(--storex-tabbar-height, 56px))',
        }}
      >
        {/* Top Navigation Bar */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
          style={{ backgroundColor: 'var(--stitch-surface)' }}
        >
          <div className="flex items-center gap-4">
            <button
              aria-label="Orqaga"
              className="flex items-center justify-center w-10 h-10 rounded-full press-effect"
              onClick={() => navigate(-1)}
              style={{ color: 'var(--stitch-primary)' }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1
              className="font-headline font-semibold text-lg"
              style={{ color: 'var(--stitch-on-surface)' }}
            >
              Profil
            </h1>
          </div>
          <button
            aria-label="Chiqish"
            className="flex items-center justify-center w-10 h-10 rounded-full press-effect"
            onClick={handleLogout}
            style={{ color: 'var(--stitch-primary)' }}
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </header>

        <main className="max-w-md mx-auto px-6 pt-4 pb-32">
          {/* User Identity */}
          <section className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div
                className="w-24 h-24 rounded-full overflow-hidden"
                style={{
                  border: '4px solid var(--stitch-surface-container-lowest)',
                  boxShadow: '0 20px 25px -5px rgba(0, 97, 164, 0.05), 0 8px 10px -6px rgba(0, 97, 164, 0.05)',
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-[32px] font-bold"
                    style={{
                      backgroundColor: 'var(--stitch-surface-container)',
                      color: 'var(--stitch-primary)',
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                )}
              </div>
              <button
                aria-label="Tahrirlash"
                className="absolute bottom-0 right-0 p-2 rounded-full press-effect"
                style={{
                  backgroundColor: 'var(--stitch-primary)',
                  border: '2px solid var(--stitch-surface-container-lowest)',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}
              >
                <span className="material-symbols-outlined filled" style={{ fontSize: 14 }}>
                  edit
                </span>
              </button>
            </div>
            <h2
              className="font-headline font-bold text-2xl tracking-tight"
              style={{ color: 'var(--stitch-on-surface)' }}
            >
              {fullName}
            </h2>
            {phoneOrUsername && (
              <p
                className="font-body font-medium mt-1"
                style={{ color: 'var(--stitch-on-surface-variant)' }}
              >
                {phoneOrUsername}
              </p>
            )}
          </section>

          {/* Bento Stats Grid */}
          <section className="grid grid-cols-3 gap-3 mb-8">
            <StatCard
              icon="shopping_bag"
              tint="primary"
              count={profile?.stats?.orders_count ?? 0}
              label="Buyurtmalar"
              onClick={() => navigate('/orders')}
            />
            <StatCard
              icon="favorite"
              tint="error"
              count={profile?.stats?.favorites_count ?? 0}
              label="Sevimlilar"
              onClick={() => navigate('/favorites')}
            />
            <StatCard
              icon="location_on"
              tint="secondary"
              count={profile?.stats?.addresses_count ?? 0}
              label="Manzillar"
              onClick={() => navigate('/profile/addresses')}
            />
          </section>

          {/* Menu groups */}
          <MenuGroup title="Buyurtmalar" items={ordersGroup} navigate={navigate} haptic={haptic} />
          <MenuGroup title="Sozlamalar" items={settingsGroup} navigate={navigate} haptic={haptic} />
          <MenuGroup title="Qo'llab-quvvatlash" items={supportGroup} navigate={navigate} haptic={haptic} />
        </main>
      </div>
    </PageLayout>
  );
}

function StatCard({
  icon,
  tint,
  count,
  label,
  onClick,
}: {
  icon: string;
  tint: 'primary' | 'error' | 'secondary';
  count: number;
  label: string;
  onClick: () => void;
}) {
  const colorMap = {
    primary: 'var(--stitch-primary)',
    error: 'var(--stitch-error)',
    secondary: 'var(--stitch-secondary)',
  };
  const tintBg = {
    primary: 'rgba(0, 97, 164, 0.1)',
    error: 'rgba(186, 26, 26, 0.1)',
    secondary: 'rgba(65, 96, 132, 0.1)',
  };
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center text-center press-effect"
      style={{
        backgroundColor: 'var(--stitch-surface-container-lowest)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: tintBg[tint], color: colorMap[tint] }}
      >
        <span className="material-symbols-outlined filled" style={{ fontSize: 22 }}>
          {icon}
        </span>
      </div>
      <span
        className="font-headline font-bold text-xl"
        style={{ color: 'var(--stitch-on-surface)' }}
      >
        {count}
      </span>
      <span
        className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
        style={{ color: 'var(--stitch-on-surface-variant)' }}
      >
        {label}
      </span>
    </button>
  );
}

function MenuGroup({
  title,
  items,
  navigate,
  haptic,
}: {
  title: string;
  items: MenuItem[];
  navigate: (path: string) => void;
  haptic: ReturnType<typeof useHaptic>;
}) {
  return (
    <div className="mb-6">
      <h3
        className="font-headline font-bold text-sm mb-3 px-1"
        style={{ color: 'var(--stitch-on-surface-variant)' }}
      >
        {title}
      </h3>
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--stitch-surface-container-lowest)',
          borderRadius: 16,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const interactive = !!(item.path || item.onClick);
          const handleActivate = () => {
            if (item.onClick) {
              item.onClick();
            } else if (item.path) {
              haptic.selectionChanged();
              navigate(item.path);
            }
          };
          const rowContent = (
            <>
              <span
                className="material-symbols-outlined"
                style={{ color: 'var(--stitch-on-surface-variant)', fontSize: 22 }}
              >
                {item.icon}
              </span>
              <span
                className="flex-1 font-body font-medium text-[15px]"
                style={{ color: 'var(--stitch-on-surface)' }}
              >
                {item.label}
              </span>
              {item.trailing}
              {item.path && (
                <span
                  className="material-symbols-outlined"
                  style={{ color: 'var(--stitch-outline-variant)', fontSize: 20 }}
                >
                  chevron_right
                </span>
              )}
            </>
          );
          return (
            <div key={item.label}>
              {interactive ? (
                <button
                  type="button"
                  className="flex items-center gap-4 w-full text-left press-effect py-4 px-5"
                  onClick={handleActivate}
                >
                  {rowContent}
                </button>
              ) : (
                <div className="flex items-center gap-4 w-full py-4 px-5">{rowContent}</div>
              )}
              {!isLast && (
                <div
                  className="mx-5"
                  style={{ borderBottom: '1px solid var(--stitch-surface-container)' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      className="relative w-11 h-6 rounded-full transition-colors duration-200"
      style={{
        backgroundColor: on ? 'var(--stitch-primary)' : 'var(--stitch-surface-container-highest)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
        style={{
          left: on ? 22 : 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          border: on ? 'none' : '1px solid #d1d5db',
        }}
      />
    </button>
  );
}

function VersionPill({ version }: { version: string }) {
  return (
    <span
      className="text-xs font-mono px-2 py-1 rounded"
      style={{
        backgroundColor: 'var(--stitch-surface-container)',
        color: 'var(--stitch-on-surface-variant)',
      }}
    >
      {version}
    </span>
  );
}

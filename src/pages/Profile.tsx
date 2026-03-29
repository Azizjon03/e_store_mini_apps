import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getProfile } from '@/api/storefront';
import { PageLayout } from '@/components/layout/PageLayout';
import { useHaptic } from '@/hooks/useHaptic';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
  path: string;
  trailing?: React.ReactNode;
}

const orderMenuItems: MenuItem[] = [
  {
    icon: <BoxIcon />,
    label: 'Buyurtmalarim',
    path: '/orders',
  },
  {
    icon: <HeartIcon />,
    label: 'Sevimlilar',
    path: '/favorites',
  },
];

const settingsMenuItems: MenuItem[] = [
  {
    icon: <PinIcon />,
    label: 'Manzillarim',
    path: '/profile/addresses',
  },
  {
    icon: <GlobeIcon />,
    label: 'Til',
    path: '/profile/language',
    trailing: <span className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>O'zbekcha</span>,
  },
];

const supportMenuItems: MenuItem[] = [
  {
    icon: <ChatIcon />,
    label: 'Yordam',
    path: '/support',
  },
  {
    icon: <InfoIcon />,
    label: 'Ilova haqida',
    path: '/about',
    trailing: <span className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>v1.0.0</span>,
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const haptic = useHaptic();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  return (
    <PageLayout showSearch={false}>
      <div className="px-4 py-4 page-enter">
        {/* User info */}
        <div className="flex flex-col items-center mb-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3"
            style={{
              backgroundColor: 'var(--storex-primary-light)',
              color: 'var(--storex-primary)',
            }}
          >
            {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <p className="text-lg font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
            {user?.first_name} {user?.last_name ?? ''}
          </p>
          {user?.username && (
            <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
              @{user.username}
            </p>
          )}
          {profile?.phone && (
            <p className="text-[13px] mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {profile.phone}
            </p>
          )}
        </div>

        {/* Quick stats */}
        <div
          className="flex items-center justify-around py-3 mb-4"
          style={{
            backgroundColor: 'var(--tg-theme-bg-color)',
            borderRadius: 'var(--storex-radius-lg)',
            border: 'var(--storex-border-card)',
            boxShadow: 'var(--storex-shadow-sm)',
          }}
        >
          <StatItem icon={<BoxIcon />} count={profile?.stats?.orders_count ?? 0} label="BUYURTMALAR" onClick={() => navigate('/orders')} />
          <div className="w-px h-8" style={{ backgroundColor: 'var(--storex-border)' }} />
          <StatItem icon={<HeartIcon />} count={profile?.stats?.favorites_count ?? 0} label="SEVIMLILAR" onClick={() => navigate('/favorites')} />
          <div className="w-px h-8" style={{ backgroundColor: 'var(--storex-border)' }} />
          <StatItem icon={<PinIcon />} count={profile?.stats?.addresses_count ?? 0} label="MANZILLAR" onClick={() => navigate('/profile/addresses')} />
        </div>

        {/* Menu groups */}
        <MenuGroup title="Buyurtmalar" items={orderMenuItems} navigate={navigate} haptic={haptic} />
        <MenuGroup title="Sozlamalar" items={settingsMenuItems} navigate={navigate} haptic={haptic} />
        <MenuGroup title="Qo'llab-quvvatlash" items={supportMenuItems} navigate={navigate} haptic={haptic} />

        {/* Version */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--tg-theme-hint-color)' }}>
          <span className="font-semibold" style={{ color: 'var(--storex-primary)' }}>StoreX</span> v1.0.0
        </p>
      </div>
    </PageLayout>
  );
}

function StatItem({ icon, count, label, onClick }: { icon: React.ReactNode; count: number; label: string; onClick: () => void }) {
  return (
    <button className="flex flex-col items-center gap-1 px-4 press-effect" onClick={onClick}>
      <div style={{ color: 'var(--storex-primary)' }}>{icon}</div>
      <span className="text-lg font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>{count}</span>
      <span className="text-[9px] font-semibold tracking-wider" style={{ color: 'var(--tg-theme-hint-color)' }}>{label}</span>
    </button>
  );
}

function MenuGroup({ title, items, navigate, haptic }: { title: string; items: MenuItem[]; navigate: (path: string) => void; haptic: ReturnType<typeof useHaptic> }) {
  return (
    <div className="mb-3">
      <p className="text-[13px] font-semibold mb-1.5 px-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
        {title}
      </p>
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderRadius: 'var(--storex-radius-lg)',
          border: 'var(--storex-border-card)',
          boxShadow: 'var(--storex-shadow-sm)',
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.path}
            className="flex items-center w-full px-4 py-3 text-left press-effect"
            style={{
              borderBottom: index < items.length - 1 ? '1px solid var(--storex-border)' : 'none',
            }}
            onClick={() => {
              haptic.selectionChanged();
              navigate(item.path);
            }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--storex-primary-light)',
                borderRadius: 'var(--storex-radius-sm)',
                color: 'var(--storex-primary)',
              }}
            >
              {item.icon}
            </div>
            <span className="text-sm font-medium ml-3 flex-1" style={{ color: 'var(--tg-theme-text-color)' }}>
              {item.label}
            </span>
            {item.trailing}
            <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-hint-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Icons */
function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

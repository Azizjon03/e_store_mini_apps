import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';
import { useHaptic } from '@/hooks/useHaptic';

const tabs: Array<{
  path: string;
  label: string;
  icon: (active: boolean) => ReactNode;
  badge?: boolean;
}> = [
  { path: '/', label: 'Asosiy', icon: (a) => <HomeIcon active={a} /> },
  { path: '/catalog', label: 'Katalog', icon: (a) => <CatalogIcon active={a} /> },
  { path: '/cart', label: 'Savat', icon: (a) => <CartIcon active={a} />, badge: true },
  { path: '/profile', label: 'Profil', icon: (a) => <ProfileIcon active={a} /> },
];

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems);
  const haptic = useHaptic();

  const isTabActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const hideOn = ['/checkout', '/search', '/order-success'];
  if (hideOn.some((p) => location.pathname.startsWith(p))) return null;
  if (location.pathname.startsWith('/product/')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        backgroundColor: 'var(--tg-theme-bg-color)',
        borderTop: '1px solid var(--storex-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map((tab) => {
        const active = isTabActive(tab.path);
        return (
          <button
            key={tab.path}
            className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 relative"
            style={{ minHeight: 52 }}
            onClick={() => {
              haptic.selectionChanged();
              navigate(tab.path);
            }}
          >
            <div className="relative">
              {tab.icon(active)}
              {tab.badge && <Badge count={totalItems()} />}
            </div>
            <span
              className="text-[10px] font-medium"
              style={{
                color: active
                  ? 'var(--storex-primary)'
                  : 'var(--tg-theme-hint-color, #999)',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ===== Icons ===== */

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color, #999)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0}>
      <path
        d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5h-4a1 1 0 01-1-1v-4.5a1 1 0 00-1-1h-3a1 1 0 00-1 1V20.5a1 1 0 01-1 1H5.5A1.5 1.5 0 014 20V10.5z"
        fill={active ? color : 'none'}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CatalogIcon({ active }: { active: boolean }) {
  const color = active ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color, #999)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0} stroke={color} strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0} stroke={color} strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0} stroke={color} strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0} stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function CartIcon({ active }: { active: boolean }) {
  const color = active ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color, #999)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
        fill={active ? color : 'none'}
        fillOpacity={active ? 0.15 : 0}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 6h18" stroke={color} strokeWidth="1.8" />
      <path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color, #999)';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0} stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

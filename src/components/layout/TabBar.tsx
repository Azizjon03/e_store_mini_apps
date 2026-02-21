import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';
import { useHaptic } from '@/hooks/useHaptic';

const tabs: Array<{
  path: string;
  label: string;
  icon: (props: { color: string }) => ReactNode;
  badge?: boolean;
}> = [
  { path: '/', label: 'Bosh', icon: HomeIcon },
  { path: '/catalog', label: 'Katalog', icon: CatalogIcon },
  { path: '/cart', label: 'Savat', icon: CartIcon, badge: true },
  { path: '/profile', label: 'Profil', icon: ProfileIcon },
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

  // Hide tab bar on certain pages
  const hideOn = ['/checkout', '/search', '/order-success'];
  if (hideOn.some((p) => location.pathname.startsWith(p))) return null;
  if (location.pathname.startsWith('/product/')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        backgroundColor: 'var(--tg-theme-bg-color)',
        borderTop: '0.5px solid var(--tg-theme-hint-color, rgba(0,0,0,0.1))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map((tab) => {
        const active = isTabActive(tab.path);
        const color = active
          ? 'var(--tg-theme-button-color, #2481cc)'
          : 'var(--tg-theme-hint-color, #999)';

        return (
          <button
            key={tab.path}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
            style={{ minHeight: 56 }}
            onClick={() => {
              haptic.selectionChanged();
              navigate(tab.path);
            }}
          >
            <div className="relative">
              <tab.icon color={color} />
              {tab.badge && <Badge count={totalItems()} />}
            </div>
            <span className="text-[10px]" style={{ color }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21V12h6v9"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CatalogIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function CartIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 6h18" stroke={color} strokeWidth="1.8" />
      <path
        d="M16 10a4 4 0 01-8 0"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

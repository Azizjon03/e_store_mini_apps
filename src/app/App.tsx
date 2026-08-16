import { useState, useEffect, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { initTelegram } from '@/lib/telegram';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useBackButton } from '@/hooks/useBackButton';
import { getStoreConfig } from '@/api/storefront';
import { me } from '@/api/auth';

/**
 * The phone-shaped column every route renders into.
 *
 * This lives here, above the router's `Outlet`, rather than in `PageLayout`:
 * eight screens (Checkout, Login, Register, Search, OrderSuccess,
 * ProductDetail, Addresses, AddressForm) render their own root instead of
 * going through `PageLayout`, so a constraint applied there would leave them
 * stretched edge to edge on a desktop window while the rest of the app sat in
 * a column. `fixed` chrome — TabBar, SubmitBar, BottomSheet — escapes this
 * wrapper by definition and carries the same max-width itself.
 *
 * Below 480px the column resolves to 100%, so the layout inside Telegram is
 * untouched and the surrounding surface never becomes visible.
 */
function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
    >
      <div
        className="w-full max-w-(--storex-app-max-width)"
        style={{
          backgroundColor: 'var(--tg-theme-bg-color)',
          // Hairlines down the two long edges rather than a border, so the
          // column keeps its exact width and nothing shifts. Three screens
          // (Profile, product detail, order detail) paint their own background
          // in the same token as the surround, so without this the column has
          // no visible edge on them at all.
          boxShadow:
            '1px 0 0 color-mix(in srgb, var(--tg-theme-text-color) 12%, transparent), -1px 0 0 color-mix(in srgb, var(--tg-theme-text-color) 12%, transparent)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--tg-theme-bg-color)',
        color: 'var(--tg-theme-text-color)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--tg-theme-button-color, #7B2FBE), #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          StoreX
        </h1>
      </div>

      <div
        style={{
          padding: '16px 16px 32px',
        }}
      >
        <button
          onClick={onEnter}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, var(--tg-theme-button-color, #7B2FBE), #a855f7)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Kirish
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [entered, setEntered] = useState(false);
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const setStoreConfig = useAppStore((s) => s.setStoreConfig);
  const setLoading = useAppStore((s) => s.setLoading);

  useEffect(() => {
    if (!entered) return;

    initTelegram();

    getStoreConfig()
      .then((config) => setStoreConfig(config))
      .catch(() => { /* store config is optional, app works without it */ })
      .finally(() => setLoading(false));

    // Refresh stored AuthUser from the server when we already hold a token.
    if (token) {
      me()
        .then((user) => setUser(user))
        .catch((err) => {
          if (err?.response?.status === 401) logout();
        });
    }
  }, [entered, token, setUser, logout, setStoreConfig, setLoading]);

  useBackButton();

  if (!entered) {
    return (
      <AppShell>
        <WelcomeScreen onEnter={() => setEntered(true)} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

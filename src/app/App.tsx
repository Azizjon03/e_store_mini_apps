import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { initTelegram, getTelegramUser } from '@/lib/telegram';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useBackButton } from '@/hooks/useBackButton';
import { getStoreConfig } from '@/api/storefront';

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
  const setUser = useAuthStore((s) => s.setUser);
  const setStoreConfig = useAppStore((s) => s.setStoreConfig);
  const setLoading = useAppStore((s) => s.setLoading);

  useEffect(() => {
    if (!entered) return;

    initTelegram();
    const user = getTelegramUser();
    if (user) {
      setUser({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        language_code: user.language_code,
        is_premium: user.is_premium,
      });
    }

    getStoreConfig()
      .then((config) => setStoreConfig(config))
      .catch(() => { /* store config is optional, app works without it */ })
      .finally(() => setLoading(false));
  }, [entered, setUser, setStoreConfig, setLoading]);

  useBackButton();

  if (!entered) {
    return <WelcomeScreen onEnter={() => setEntered(true)} />;
  }

  return <Outlet />;
}

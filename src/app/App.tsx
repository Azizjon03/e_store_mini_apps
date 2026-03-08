import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { initTelegram, getTelegramUser } from '@/lib/telegram';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useBackButton } from '@/hooks/useBackButton';
import { getStoreConfig } from '@/api/storefront';

export function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setStoreConfig = useAppStore((s) => s.setStoreConfig);
  const setLoading = useAppStore((s) => s.setLoading);

  useEffect(() => {
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
  }, [setUser, setStoreConfig, setLoading]);

  useBackButton();

  return <Outlet />;
}

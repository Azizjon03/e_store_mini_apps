import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { initTelegram, getTelegramUser } from '@/lib/telegram';
import { useAuthStore } from '@/store/authStore';
import { useBackButton } from '@/hooks/useBackButton';

export function App() {
  const setUser = useAuthStore((s) => s.setUser);

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
  }, [setUser]);

  useBackButton();

  return <Outlet />;
}

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';

export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isTelegramWebApp) return;

    if (location.pathname === '/') {
      WebApp.BackButton.hide();
    } else {
      WebApp.BackButton.show();
    }

    const handleBack = () => navigate(-1);
    WebApp.BackButton.onClick(handleBack);

    return () => {
      WebApp.BackButton.offClick(handleBack);
    };
  }, [location.pathname, navigate]);
}

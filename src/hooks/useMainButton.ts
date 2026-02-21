import { useEffect, useRef } from 'react';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';

interface MainButtonConfig {
  text?: string;
  color?: string;
  textColor?: string;
  isActive?: boolean;
  isVisible?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}

export function useMainButton(config: MainButtonConfig) {
  const handlerRef = useRef(config.onClick);
  useEffect(() => { handlerRef.current = config.onClick; });

  // Update button appearance
  useEffect(() => {
    if (!isTelegramWebApp) return;
    const btn = WebApp.MainButton;

    if (config.text && config.isVisible !== false) {
      btn.setText(config.text);
      btn.show();
    } else {
      btn.hide();
      return;
    }

    if (config.color) {
      btn.setParams({ color: config.color });
    }
    if (config.textColor) {
      btn.setParams({ text_color: config.textColor });
    }

    if (config.isActive === false) {
      btn.disable();
    } else {
      btn.enable();
    }

    if (config.isLoading) {
      btn.showProgress(true);
    } else {
      btn.hideProgress();
    }
  }, [config.text, config.color, config.textColor, config.isActive, config.isVisible, config.isLoading]);

  // Stable event listener — register once, never re-registers
  useEffect(() => {
    if (!isTelegramWebApp) return;
    const btn = WebApp.MainButton;
    const stableHandler = () => handlerRef.current?.();
    btn.onClick(stableHandler);
    return () => {
      btn.offClick(stableHandler);
      btn.hide();
    };
  }, []);
}

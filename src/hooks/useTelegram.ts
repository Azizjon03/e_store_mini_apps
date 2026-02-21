import { isTelegramWebApp, WebApp } from '@/lib/telegram';

const noop = () => {};

export function useTelegram() {
  if (!isTelegramWebApp) {
    return {
      webApp: null,
      user: undefined,
      colorScheme: 'light' as const,
      initData: '',
      expand: noop,
      close: noop,
      showAlert: noop as (message: string) => void,
      showConfirm: () => Promise.resolve(false),
    };
  }

  return {
    webApp: WebApp,
    user: WebApp.initDataUnsafe?.user,
    colorScheme: WebApp.colorScheme,
    initData: WebApp.initData,
    expand: () => WebApp.expand(),
    close: () => WebApp.close(),
    showAlert: (message: string) => WebApp.showAlert(message),
    showConfirm: (message: string) =>
      new Promise<boolean>((resolve) => WebApp.showConfirm(message, resolve)),
  };
}

import { isTelegramWebApp, WebApp } from '@/lib/telegram';

const noop = () => {};

export function useTelegram() {
  if (!isTelegramWebApp) {
    return {
      webApp: null,
      user: undefined,
      colorScheme: 'light' as const,
      initData: '',
      // `expand`/`close` have no browser equivalent — a page cannot resize the
      // Telegram sheet or close itself — so a no-op is the honest degradation.
      expand: noop,
      close: noop,
      // Dialogs do have one. Returning a hard `false` here used to degrade
      // "ask the user" into "silently answer no", which killed every
      // confirm-gated action outside Telegram (address delete never fired:
      // no dialog, no request, no feedback). Ask with the browser's own
      // dialog and return the real answer instead.
      showAlert: (message: string) => window.alert(message),
      showConfirm: (message: string) => Promise.resolve(window.confirm(message)),
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

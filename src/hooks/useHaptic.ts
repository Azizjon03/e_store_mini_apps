import { isTelegramWebApp, WebApp } from '@/lib/telegram';

const noop = () => {};

export function useHaptic() {
  if (!isTelegramWebApp) {
    return {
      selectionChanged: noop,
      impact: noop as (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void,
      notification: noop as (type: 'success' | 'error' | 'warning') => void,
    };
  }

  const haptic = WebApp.HapticFeedback;
  return {
    selectionChanged: () => haptic.selectionChanged(),
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') =>
      haptic.impactOccurred(style),
    notification: (type: 'success' | 'error' | 'warning') =>
      haptic.notificationOccurred(type),
  };
}

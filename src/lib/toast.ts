export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

let toastId = 0;
export const toastListeners: Array<(toast: ToastMessage) => void> = [];

export function showToast(type: ToastType, message: string) {
  const toast: ToastMessage = { id: ++toastId, type, message };
  toastListeners.forEach((fn) => fn(toast));
}

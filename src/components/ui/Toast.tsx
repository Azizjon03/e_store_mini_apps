import { useEffect, useState, useCallback } from 'react';
import { toastListeners, type ToastType, type ToastMessage } from '@/lib/toast';

const COLORS: Record<ToastType, string> = {
  success: '#31b545',
  error: '#e53e3e',
  info: 'var(--tg-theme-link-color, #2481cc)',
  warning: '#e8a427',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts((prev) => [toast, ...prev]);
    const duration = toast.type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, duration);
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      const idx = toastListeners.indexOf(addToast);
      if (idx !== -1) toastListeners.splice(idx, 1);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col gap-2 p-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-[12px] px-4 py-3 text-sm font-medium toast-slide-down pointer-events-auto"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
            color: 'var(--tg-theme-text-color)',
            borderLeft: `4px solid ${COLORS[toast.type]}`,
          }}
          onClick={() =>
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          }
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

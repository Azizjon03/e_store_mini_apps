import { useEffect, type ReactNode } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 fade-in"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[16px] flex flex-col slide-up"
        style={{ backgroundColor: 'var(--tg-theme-bg-color, #fff)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div
            className="w-9 h-1 rounded-full"
            style={{ backgroundColor: 'var(--tg-theme-hint-color, #ccc)' }}
          />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-[16px] font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-lg"
              style={{ color: 'var(--tg-theme-hint-color)' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-4 pb-8">{children}</div>
      </div>
    </div>
  );
}

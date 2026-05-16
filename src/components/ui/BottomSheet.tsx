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
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] flex flex-col slide-up"
        style={{
          backgroundColor: 'var(--tg-theme-bg-color, #fff)',
          borderTopLeftRadius: 'var(--storex-radius-lg)',
          borderTopRightRadius: 'var(--storex-radius-lg)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--tg-theme-hint-color, #ccc)' }}
          />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-4 pb-4">
            <h3 className="text-[17px] font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>{title}</h3>
            <button
              onClick={onClose}
              aria-label="Yopish"
              className="w-9 h-9 flex items-center justify-center rounded-full press-effect"
              style={{
                color: 'var(--tg-theme-hint-color)',
                backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Content — spec: 24px top padding (handled via header pt-4 + 8px), 16px content gaps */}
        <div className={`overflow-y-auto px-6 pb-8 ${title ? '' : 'pt-6'}`}>{children}</div>
      </div>
    </div>
  );
}

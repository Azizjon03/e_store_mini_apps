import type { ReactNode } from 'react';

interface SubmitBarProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  hint?: ReactNode;
  /** Set when the page also renders a TabBar so we don't cover it. */
  aboveTabBar?: boolean;
}

/**
 * Sticky primary action bar shown at the bottom of forms.
 * Used everywhere (Telegram WebApp + plain browser) — we no longer rely on the
 * Telegram MainButton because it didn't render reliably in the real app.
 */
export function SubmitBar({ text, onClick, disabled, loading, hint, aboveTabBar }: SubmitBarProps) {
  return (
    <div
      className="fixed left-0 right-0 z-40 mx-auto max-w-(--storex-app-max-width)"
      style={{
        bottom: aboveTabBar
          ? 'calc(var(--storex-tabbar-height, 56px) + env(safe-area-inset-bottom, 0px))'
          : 0,
        paddingBottom: aboveTabBar ? 12 : 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        paddingTop: 12,
        paddingLeft: 16,
        paddingRight: 16,
        backgroundColor: 'var(--tg-theme-bg-color, #fff)',
        borderTop: '1px solid var(--storex-border)',
        boxShadow: '0 -4px 16px color-mix(in srgb, var(--tg-theme-text-color) 4%, transparent)',
      }}
    >
      {hint && (
        <p className="text-[12px] mb-2 text-center" style={{ color: 'var(--tg-theme-hint-color)' }}>
          {hint}
        </p>
      )}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onClick}
        className="w-full h-12 font-semibold text-[15px] press-effect transition-opacity"
        style={{
          backgroundColor: 'var(--storex-primary)',
          color: '#fff',
          borderRadius: 'var(--storex-radius-md, 14px)',
          opacity: disabled || loading ? 0.5 : 1,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Yuklanmoqda...' : text}
      </button>
    </div>
  );
}

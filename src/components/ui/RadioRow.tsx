import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface RadioRowProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** 'start' vertically pins the icon/indicator to the top of the row —
   * use it when `subtitle` wraps to more than one line. */
  align?: 'center' | 'start';
  className?: string;
}

/**
 * Selectable row used across Checkout.tsx for delivery method, address,
 * pickup point and payment method — same card, border and radio-dot
 * treatment everywhere instead of four hand-written copies.
 */
export function RadioRow({
  icon,
  title,
  subtitle,
  trailing,
  selected,
  onClick,
  disabled,
  align = 'center',
  className,
}: RadioRowProps) {
  return (
    <button
      type="button"
      className={cn(
        'storex-card press-effect flex gap-3 p-3 w-full text-left',
        align === 'start' ? 'items-start' : 'items-center',
        className,
      )}
      style={{
        border: selected
          ? '1.5px solid var(--storex-primary)'
          : '1.5px solid var(--storex-border)',
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && (
        <span className={cn('shrink-0', align === 'start' && 'mt-0.5')}>{icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
          {title}
        </p>
        {subtitle && (
          <div className="mt-0.5 text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {subtitle}
          </div>
        )}
      </div>
      {trailing}
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
          align === 'start' && 'mt-1',
        )}
        style={{ borderColor: selected ? 'var(--storex-primary)' : 'var(--tg-theme-hint-color)' }}
      >
        {selected && (
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--storex-primary)' }} />
        )}
      </div>
    </button>
  );
}

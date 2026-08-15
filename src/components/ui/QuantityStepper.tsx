import { cn } from '@/lib/cn';

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Used only to decide whether the decrement button shows the "remove"
   * affordance (see `removeAtMin`) — does not disable the button, since
   * every current call site still wants a tap at `min` to remove the item. */
  min?: number;
  max?: number;
  disabled?: boolean;
  /** Swap the decrement button to a trash icon in the danger color once
   * `value` has reached `min`, signalling that tapping it removes the item
   * instead of decrementing further (the cart's own behaviour). */
  removeAtMin?: boolean;
  className?: string;
}

/**
 * Minus / count / plus control. Both buttons are 48x48 — the Apple HIG /
 * DESIGN_STANDARD.md §8 tap-target minimum — so this is the one place in the
 * app a quantity stepper is built; screens compose it rather than
 * hand-rolling their own smaller version.
 */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max,
  disabled,
  removeAtMin = false,
  className,
}: QuantityStepperProps) {
  const showRemove = removeAtMin && value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div
      className={cn('flex items-center overflow-hidden', className)}
      style={{
        borderRadius: 'var(--storex-radius-md)',
        border: '1px solid var(--storex-border)',
      }}
    >
      <button
        type="button"
        aria-label={showRemove ? "O'chirish" : 'Kamaytirish'}
        className="w-12 h-12 shrink-0 grid place-items-center press-effect disabled:opacity-50"
        style={{ color: showRemove ? 'var(--storex-danger)' : 'var(--storex-primary)' }}
        onClick={onDecrement}
        disabled={disabled}
      >
        {showRemove ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>
      <span
        className="min-w-[32px] text-center text-[15px] font-semibold"
        style={{ color: 'var(--tg-theme-text-color)' }}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Ko'paytirish"
        className="w-12 h-12 shrink-0 grid place-items-center press-effect disabled:opacity-50"
        style={{ color: 'var(--storex-primary)' }}
        onClick={onIncrement}
        disabled={disabled || atMax}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

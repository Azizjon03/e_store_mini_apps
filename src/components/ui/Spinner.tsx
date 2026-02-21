import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--tg-theme-hint-color, #999)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          strokeDashoffset="0"
        />
      </svg>
    </div>
  );
}

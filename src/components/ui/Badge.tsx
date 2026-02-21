import { cn } from '@/lib/cn';

interface BadgeProps {
  count: number;
  className?: string;
}

export function Badge({ count, className }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center',
        'rounded-full text-[10px] font-semibold leading-none badge-bounce',
        className,
      )}
      style={{
        backgroundColor: 'var(--store-badge-bg)',
        color: 'var(--store-badge-text)',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

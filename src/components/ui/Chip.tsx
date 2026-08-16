import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  active?: boolean;
  children: ReactNode;
}

/**
 * Thin wrapper around the `.storex-chip` / `.storex-chip.active` classes in
 * global.css — screens should use this instead of writing their own
 * inline-style override of the active state.
 */
export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button type="button" className={cn('storex-chip', active && 'active', className)} {...props}>
      {children}
    </button>
  );
}

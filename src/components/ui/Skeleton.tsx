import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-(--storex-radius-md) shimmer', className)}
      style={{ backgroundColor: 'var(--storex-skeleton)' }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="storex-card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-2.5 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3 rounded-(--storex-radius-sm)" />
        <Skeleton className="h-3.5 w-full rounded-(--storex-radius-sm)" />
        <Skeleton className="h-3 w-1/3 rounded-(--storex-radius-sm)" />
        <Skeleton className="h-8 w-full rounded-(--storex-radius-sm)" />
      </div>
    </div>
  );
}

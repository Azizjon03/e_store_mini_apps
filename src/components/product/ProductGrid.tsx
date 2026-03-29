import type { Product } from '@/api/types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export function ProductGrid({ products, isLoading, skeletonCount = 4 }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2.5 items-stretch">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="grid grid-cols-2 gap-2.5 items-stretch">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

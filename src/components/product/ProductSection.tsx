import { useNavigate } from 'react-router-dom';
import type { Product } from '@/api/types';
import { ProductGrid } from './ProductGrid';

interface ProductSectionProps {
  title: string;
  products: Product[];
  linkTo?: string;
}

export function ProductSection({ title, products, linkTo }: ProductSectionProps) {
  const navigate = useNavigate();

  if (products.length === 0) return null;

  return (
    <section className="py-3">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-[16px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
          {title}
        </h2>
        {linkTo && (
          <button
            className="text-sm"
            style={{ color: 'var(--tg-theme-link-color)' }}
            onClick={() => navigate(linkTo)}
          >
            Barchasi →
          </button>
        )}
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

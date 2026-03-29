import { useNavigate } from 'react-router-dom';
import type { Product } from '@/api/types';
import { ProductCard } from './ProductCard';
import { ProductGrid } from './ProductGrid';

interface ProductSectionProps {
  title: string;
  products: Product[];
  linkTo?: string;
  layout?: 'grid' | 'horizontal';
}

export function ProductSection({ title, products, linkTo, layout = 'grid' }: ProductSectionProps) {
  const navigate = useNavigate();

  if (products.length === 0) return null;

  return (
    <section className="py-3">
      <div className="storex-section-header">
        <h2 className="storex-section-title">{title}</h2>
        {linkTo && (
          <button
            className="storex-section-link flex items-center gap-0.5"
            onClick={() => navigate(linkTo)}
          >
            Hammasi
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
      {layout === 'horizontal' ? (
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {products.map((product) => (
            <div key={product.id} className="shrink-0" style={{ width: 150 }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}

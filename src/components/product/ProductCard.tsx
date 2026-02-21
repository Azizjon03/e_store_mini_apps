import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/api/types';
import { formatPrice } from '@/lib/format';
import { useCartStore } from '@/store/cartStore';
import { useHaptic } from '@/hooks/useHaptic';
import { useFavorite } from '@/hooks/useFavorite';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const haptic = useHaptic();
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { isFavorite, toggle: toggleFavorite } = useFavorite(product.id);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (product.variants && product.variants.length > 0) {
        navigate(`/product/${product.slug}`);
        return;
      }
      addItem(product, 1);
      haptic.impact('light');
      setAdded(true);
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
      addedTimerRef.current = setTimeout(() => setAdded(false), 1000);
    },
    [product, addItem, haptic, navigate],
  );

  return (
    <div
      className="flex flex-col cursor-pointer active:scale-[0.98] transition-transform duration-150"
      onClick={() => {
        haptic.selectionChanged();
        navigate(`/product/${product.slug}`);
      }}
    >
      {/* Image */}
      <div className="relative aspect-square rounded-[12px] overflow-hidden" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            📷
          </div>
        )}

        {/* Discount badge */}
        {product.discount_percent && product.discount_percent > 0 && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-[6px] text-[11px] font-semibold text-white bg-[var(--store-price-sale)]">
            -{product.discount_percent}%
          </span>
        )}

        {/* Favorite heart */}
        <button
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-[1.3]"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
        >
          <span className="text-xs">{isFavorite ? '❤️' : '🤍'}</span>
        </button>
      </div>

      {/* Info */}
      <div className="mt-2 flex flex-col gap-1">
        <p
          className="text-sm leading-[18px] line-clamp-2"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {product.name}
        </p>

        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
            {formatPrice(product.price)}
          </span>
          {product.old_price && (
            <span
              className="text-xs line-through"
              style={{ color: 'var(--store-price-old)' }}
            >
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <button
          className="mt-1 h-8 rounded-[8px] text-xs font-medium transition-all duration-150 active:scale-[0.95]"
          style={{
            backgroundColor: added
              ? 'var(--store-success)'
              : 'var(--tg-theme-button-color)',
            color: 'var(--tg-theme-button-text-color)',
          }}
          onClick={handleAddToCart}
        >
          {added ? '✓' : product.in_stock ? 'Savatga' : 'Mavjud emas'}
        </button>
      </div>
    </div>
  );
}

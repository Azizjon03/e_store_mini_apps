import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/api/types';
import { formatPrice, t } from '@/lib/format';
import { useCartStore } from '@/store/cartStore';
import { useHaptic } from '@/hooks/useHaptic';
import { useFavorite } from '@/hooks/useFavorite';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const haptic = useHaptic();
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { isFavorite, toggle: toggleFavorite } = useFavorite(product.id);

  const inCart = cartItems.some((i) => i.product_id === product.id);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const handleCartAction = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (inCart) {
        haptic.selectionChanged();
        navigate('/cart');
        return;
      }
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
    [product, addItem, haptic, navigate, inCart],
  );

  const discountPercent = product.discount_percent || product.discount_percentage || 0;
  const hasOldPrice = !!(product.old_price || product.compare_price);

  return (
    <div
      className="flex flex-col cursor-pointer overflow-hidden press-effect min-w-0 h-full storex-surface"
      onClick={() => {
        haptic.selectionChanged();
        navigate(`/product/${product.slug}`);
      }}
    >
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          borderRadius: 'var(--storex-radius-md) var(--storex-radius-md) 0 0',
        }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={t(product.name)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--tg-theme-hint-color)" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="var(--tg-theme-hint-color)" />
              <path d="M21 15l-5-5L5 21" stroke="var(--tg-theme-hint-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span
            className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide"
            style={{
              backgroundColor: 'var(--storex-price-sale)',
              borderRadius: 'var(--storex-radius-xs)',
            }}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Favorite button. The plate follows the theme rather than staying
            white: the unfavourited heart is stroked in --tg-theme-hint-color,
            which Telegram sets to a light grey in dark mode — light-on-white,
            effectively invisible. */}
        <button
          aria-label={isFavorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center press-effect"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--tg-theme-bg-color) 92%, transparent)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
        >
          {isFavorite ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--storex-price-sale)">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-hint-color)" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="px-3 pt-3 pb-3 flex flex-col gap-2 flex-1">
        <p
          className="text-[13px] leading-[1.35] line-clamp-2 font-medium"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {t(product.name)}
        </p>

        {product.reviews_avg_rating && product.reviews_avg_rating > 0 && (
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="var(--storex-warning)">
              <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.93L6 8.89 2.48 10.85l.67-3.93L.3 4.14l3.94-.57z" />
            </svg>
            <span className="text-[11px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {product.reviews_avg_rating.toFixed(1)}
              {product.reviews_count ? ` (${product.reviews_count})` : ''}
            </span>
          </div>
        )}

        <div className="flex flex-col mt-auto">
          <span
            className="text-[15px] font-bold leading-tight truncate"
            style={{
              color: product.in_stock === false
                ? 'var(--tg-theme-hint-color)'
                : hasOldPrice
                  ? 'var(--storex-price-sale)'
                  : 'var(--tg-theme-text-color)',
            }}
          >
            {formatPrice(product.price)}
          </span>
          {hasOldPrice && (
            <span
              className="text-[12px] line-through leading-none mt-0.5"
              style={{ color: 'var(--storex-price-old)' }}
            >
              {formatPrice((product.old_price || product.compare_price)!)}
            </span>
          )}

          {product.in_stock !== false ? (
            <button
              aria-label={inCart ? "Savatga o'tish" : added ? "Qo'shildi" : "Sotib olish"}
              className="w-full mt-2 h-8 text-[12px] font-semibold tracking-wide uppercase transition-all duration-150 active:scale-[0.98]"
              style={{
                borderRadius: 'var(--storex-radius-sm)',
                backgroundColor: inCart
                  ? 'var(--storex-success)'
                  : added
                    ? 'var(--storex-success)'
                    : 'var(--storex-primary)',
                color: '#fff',
              }}
              onClick={handleCartAction}
            >
              {inCart ? "Savatga o'tish" : added ? "✓ Qo'shildi" : 'Sotib olish'}
            </button>
          ) : (
            <span
              className="w-full mt-2 h-8 grid place-items-center text-[11px] font-medium"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                color: 'var(--tg-theme-hint-color)',
                borderRadius: 'var(--storex-radius-sm)',
              }}
            >
              Mavjud emas
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

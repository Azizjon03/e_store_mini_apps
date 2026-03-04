import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductDetail } from '@/api/storefront';
import { formatPrice, formatDate, t } from '@/lib/format';
import { useCartStore } from '@/store/cartStore';
import { useMainButton } from '@/hooks/useMainButton';
import { useHaptic } from '@/hooks/useHaptic';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { useFavorite } from '@/hooks/useFavorite';
import type { ProductVariant } from '@/api/types';

export default function ProductDetail() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, ProductVariant>
  >({});
  const [descExpanded, setDescExpanded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touchStartX = useRef(0);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productSlug],
    queryFn: () => getProductDetail(productSlug!),
    enabled: !!productSlug,
  });

  const { isFavorite, toggle: toggleFavorite } = useFavorite(product?.id ?? 0);

  const images = product?.images?.length ? product.images : product?.image ? [product.image] : [];

  // Check if variants need to be selected
  const variantTypes = useMemo(
    () => product?.variants ? [...new Set(product.variants.map((v) => v.type))] : [],
    [product],
  );
  const allVariantsSelected = variantTypes.every((type) => selectedVariants[type]);

  // Check if already in cart
  const selectedVariant = Object.values(selectedVariants)[0];
  const cartItemId = selectedVariant
    ? `${product?.id}:${selectedVariant.id}`
    : `${product?.id}`;
  const inCart = cartItems.find((i) => i.id === cartItemId);

  // Price with variant extra
  const currentPrice = product
    ? product.price +
      Object.values(selectedVariants).reduce(
        (sum, v) => sum + (v.extra_price ?? 0),
        0,
      )
    : 0;

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    if (variantTypes.length > 0 && !allVariantsSelected) {
      return;
    }

    if (inCart) {
      navigate('/cart');
      return;
    }

    addItem(product, 1, selectedVariant);
    haptic.impact('medium');
    setJustAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setJustAdded(false), 1500);
  }, [product, variantTypes, allVariantsSelected, inCart, addItem, selectedVariant, haptic, navigate]);

  // MainButton
  const mainButtonText = !product?.in_stock
    ? 'Hozirda mavjud emas'
    : variantTypes.length > 0 && !allVariantsSelected
      ? 'Variantni tanlang'
      : justAdded
        ? '✓ Qo\'shildi'
        : inCart
          ? `Savatda (${inCart.quantity}) — Savatga o'tish`
          : `Savatga qo'shish — ${formatPrice(currentPrice)}`;

  useMainButton({
    text: mainButtonText,
    isVisible: !!product,
    isActive: product?.in_stock && (variantTypes.length === 0 || allVariantsSelected) && !justAdded,
    onClick: handleAddToCart,
  });

  // Swipe handlers for gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50 && images.length > 1) {
      if (diff > 0 && currentImage < images.length - 1) {
        setCurrentImage(currentImage + 1);
      } else if (diff < 0 && currentImage > 0) {
        setCurrentImage(currentImage - 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'var(--tg-theme-bg-color)' }} className="min-h-screen">
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="p-4 flex flex-col gap-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div style={{ backgroundColor: 'var(--tg-theme-bg-color)' }} className="min-h-screen pb-20">
      {/* Image Gallery */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <div
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ transform: `translateX(-${currentImage * 100}%)` }}
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={t(product.name)}
                className="min-w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">📷</div>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentImage ? 16 : 6,
                  height: 6,
                  backgroundColor:
                    i === currentImage ? 'var(--tg-theme-button-color)' : 'rgba(255,255,255,0.6)',
                }}
              />
            ))}
          </div>
        )}

        {/* Discount badge */}
        {product.discount_percent && product.discount_percent > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-[8px] text-xs font-semibold text-white bg-[var(--store-price-sale)]">
            -{product.discount_percent}%
          </span>
        )}

        {/* Favorite heart */}
        <button
          className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-[1.3]"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={toggleFavorite}
        >
          <span className="text-lg">{isFavorite ? '❤️' : '🤍'}</span>
        </button>
      </div>

      <div className="px-4 pt-4">
        {/* Name */}
        <h1
          className="text-[20px] font-semibold leading-6 mb-2"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {t(product.name)}
        </h1>

        {/* Rating */}
        {(product.reviews_count ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm">⭐ {product.rating}</span>
            <span className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
              ({product.reviews_count} sharh)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[24px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
            {formatPrice(currentPrice)}
          </span>
          {product.old_price && (
            <span className="text-sm line-through" style={{ color: 'var(--store-price-old)' }}>
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        {/* Variants */}
        {variantTypes.map((type) => {
          const variants = product.variants!.filter((v) => v.type === type);
          return (
            <div key={type} className="mb-4">
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
                {type === 'color' ? 'Rangni tanlang' : type === 'size' ? "O'lchamni tanlang" : type}
              </p>
              <div className="flex gap-2 flex-wrap">
                {variants.map((v) => {
                  const isSelected = selectedVariants[type]?.id === v.id;
                  return type === 'color' ? (
                    <button
                      key={v.id}
                      className="w-9 h-9 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: v.value,
                        borderColor: isSelected
                          ? 'var(--tg-theme-button-color)'
                          : 'transparent',
                      }}
                      onClick={() => {
                        haptic.selectionChanged();
                        setSelectedVariants((prev) => ({ ...prev, [type]: v }));
                      }}
                    />
                  ) : (
                    <button
                      key={v.id}
                      className="px-4 py-2 rounded-[8px] text-sm font-medium transition-all"
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--tg-theme-button-color)'
                          : 'var(--tg-theme-secondary-bg-color)',
                        color: isSelected
                          ? 'var(--tg-theme-button-text-color)'
                          : 'var(--tg-theme-text-color)',
                      }}
                      onClick={() => {
                        haptic.selectionChanged();
                        setSelectedVariants((prev) => ({ ...prev, [type]: v }));
                      }}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Separator */}
        <hr className="my-4" style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />

        {/* Description */}
        {(product.full_description || product.description) && (
          <>
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
              Tavsif
            </h3>
            <div className="relative">
              <p
                className={`text-sm leading-5 ${!descExpanded ? 'line-clamp-3' : ''}`}
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                {t(product.full_description || product.description)}
              </p>
              {!descExpanded && (
                <button
                  className="text-sm mt-1"
                  style={{ color: 'var(--tg-theme-link-color)' }}
                  onClick={() => setDescExpanded(true)}
                >
                  Ko'proq ko'rsatish ▼
                </button>
              )}
            </div>
            <hr className="my-4" style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />
          </>
        )}

        {/* Attributes */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <>
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
              Xususiyatlar
            </h3>
            <div className="flex flex-col gap-2 mb-4">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1.5 text-sm">
                  <span style={{ color: 'var(--tg-theme-hint-color)' }}>{key}</span>
                  <span style={{ color: 'var(--tg-theme-text-color)' }}>{value}</span>
                </div>
              ))}
            </div>
            <hr className="my-4" style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />
          </>
        )}

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                Sharhlar ({product.reviews_count})
              </h3>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {product.reviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="p-3 rounded-[12px]"
                  style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                      {review.user_name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      {'⭐'.repeat(review.rating)}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {review.text}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {formatDate(review.created_at)}
                  </p>
                </div>
              ))}
            </div>
            <hr className="my-4" style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }} />
          </>
        )}

        {/* Similar products */}
        {product.similar_products && product.similar_products.length > 0 && (
          <>
            <h3 className="text-[16px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              O'xshash mahsulotlar
            </h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
              {product.similar_products.map((p) => (
                <div key={p.id} className="min-w-[150px] max-w-[150px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

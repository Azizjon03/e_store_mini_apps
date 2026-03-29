import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductDetail } from '@/api/storefront';
import { formatPrice, formatDate, t } from '@/lib/format';
import { useCartStore } from '@/store/cartStore';
import { useMainButton } from '@/hooks/useMainButton';
import { useHaptic } from '@/hooks/useHaptic';
import { useBackButton } from '@/hooks/useBackButton';
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

  useBackButton();

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});
  const [descExpanded, setDescExpanded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touchStartX = useRef(0);

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

  const variantTypes = useMemo(
    () => product?.variants ? [...new Set(product.variants.map((v) => v.type))] : [],
    [product],
  );
  const allVariantsSelected = variantTypes.every((type) => selectedVariants[type]);

  const selectedVariant = Object.values(selectedVariants)[0];
  const cartItemId = selectedVariant
    ? `${product?.id}:${selectedVariant.id}`
    : `${product?.id}`;
  const inCart = cartItems.find((i) => i.id === cartItemId);

  const currentPrice = product
    ? product.price + Object.values(selectedVariants).reduce((sum, v) => sum + (v.extra_price ?? 0), 0)
    : 0;

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (variantTypes.length > 0 && !allVariantsSelected) return;
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50 && images.length > 1) {
      if (diff > 0 && currentImage < images.length - 1) setCurrentImage(currentImage + 1);
      else if (diff < 0 && currentImage > 0) setCurrentImage(currentImage - 1);
    }
  };

  const discountPercent = product?.discount_percent || product?.discount_percentage || 0;

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'var(--tg-theme-bg-color)' }} className="min-h-screen">
        <Skeleton className="w-full aspect-square rounded-none" />
        <div className="p-4 flex flex-col gap-3">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full mt-2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div style={{ backgroundColor: 'var(--tg-theme-bg-color)' }} className="min-h-screen">
      {/* Image Gallery */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          aspectRatio: '1',
        }}
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
                className="min-w-full h-full object-contain"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--tg-theme-hint-color)" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="var(--tg-theme-hint-color)" />
              <path d="M21 15l-5-5L5 21" stroke="var(--tg-theme-hint-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Top overlay buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-10">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: 'var(--storex-shadow-sm)' }}
            onClick={() => navigate(-1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex gap-2">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: 'var(--storex-shadow-sm)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isFavorite ? 'var(--storex-price-sale)' : 'rgba(255,255,255,0.9)', boxShadow: 'var(--storex-shadow-sm)' }}
              onClick={toggleFavorite}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? '#fff' : 'none'} stroke={isFavorite ? '#fff' : 'var(--tg-theme-text-color)'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div
            className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            {currentImage + 1}/{images.length}
          </div>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentImage ? 16 : 5,
                  height: 5,
                  backgroundColor: i === currentImage ? 'var(--storex-primary)' : 'rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 pt-4 pb-24">
        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold" style={{ color: 'var(--storex-primary)' }}>
            {formatPrice(currentPrice)}
          </span>
          {product.old_price && (
            <span className="text-sm line-through" style={{ color: 'var(--storex-price-old)' }}>
              {formatPrice(product.old_price)}
            </span>
          )}
          {discountPercent > 0 && (
            <span
              className="px-1.5 py-0.5 text-[11px] font-bold text-white rounded-md"
              style={{ backgroundColor: 'var(--storex-price-sale)' }}
            >
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Name */}
        <h1
          className="text-[17px] font-semibold leading-snug mb-2"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {t(product.name)}
        </h1>

        {/* Rating */}
        {(product.reviews_count ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 12 12" fill={i < Math.round(product.rating ?? 0) ? '#f59e0b' : '#e5e7eb'}>
                  <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.93L6 8.89 2.48 10.85l.67-3.93L.3 4.14l3.94-.57z" />
                </svg>
              ))}
            </div>
            <span className="text-[13px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
              {product.rating}
            </span>
            <span className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
              ({product.reviews_count} ta sharh)
            </span>
          </div>
        )}

        {/* Variants */}
        {variantTypes.map((type) => {
          const variants = product.variants!.filter((v) => v.type === type);
          return (
            <div key={type} className="mb-4">
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
                {type === 'color' ? 'Rang' : type === 'size' ? "O'lcham" : type}
              </p>
              <div className="flex gap-2 flex-wrap">
                {variants.map((v) => {
                  const isSelected = selectedVariants[type]?.id === v.id;
                  return type === 'color' ? (
                    <button
                      key={v.id}
                      className="w-9 h-9 rounded-full transition-all"
                      style={{
                        backgroundColor: v.value,
                        border: isSelected ? '2.5px solid var(--storex-primary)' : '2px solid var(--storex-border)',
                        outline: isSelected ? '2px solid var(--tg-theme-bg-color)' : 'none',
                      }}
                      onClick={() => {
                        haptic.selectionChanged();
                        setSelectedVariants((prev) => ({ ...prev, [type]: v }));
                      }}
                    />
                  ) : (
                    <button
                      key={v.id}
                      className="storex-chip"
                      style={isSelected ? {
                        backgroundColor: 'var(--storex-primary)',
                        borderColor: 'var(--storex-primary)',
                        color: '#fff',
                      } : undefined}
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

        <div className="storex-divider -mx-4 my-4" />

        {/* Description */}
        {(product.full_description || product.description) && (
          <>
            <div
              className="flex items-center justify-between cursor-pointer mb-2"
              onClick={() => setDescExpanded(!descExpanded)}
            >
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
                Tavsif
              </h3>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-hint-color)" strokeWidth="2"
                style={{ transform: descExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {descExpanded && (
              <p className="text-[13px] leading-5 mb-2" style={{ color: 'var(--tg-theme-text-color)', opacity: 0.8 }}>
                {t(product.full_description || product.description)}
              </p>
            )}
            <div className="storex-divider -mx-4 my-4" />
          </>
        )}

        {/* Attributes / Specs */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <>
            <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Xususiyatlari
            </h3>
            <div
              className="overflow-hidden mb-4"
              style={{ borderRadius: 'var(--storex-radius-md)' }}
            >
              {Object.entries(product.attributes).map(([key, value], i) => (
                <div
                  key={key}
                  className="flex justify-between px-3 py-2.5 text-[13px]"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-bg-color)',
                  }}
                >
                  <span style={{ color: 'var(--tg-theme-hint-color)' }}>{key}</span>
                  <span className="font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="storex-divider -mx-4 my-4" />
          </>
        )}

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <>
            <div className="storex-section-header px-0! mb-3">
              <h3 className="storex-section-title text-[15px]">
                Sharhlar ({product.reviews_count})
              </h3>
              <button className="storex-section-link">Hammasi</button>
            </div>
            <div className="flex flex-col gap-2.5 mb-4">
              {product.reviews.slice(0, 2).map((review) => (
                <div
                  key={review.id}
                  className="p-3"
                  style={{
                    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                    borderRadius: 'var(--storex-radius-md)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{ backgroundColor: 'var(--storex-primary-light)', color: 'var(--storex-primary)' }}
                    >
                      {review.user_name[0]}
                    </div>
                    <div className="flex-1">
                      <span className="text-[13px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                        {review.user_name}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} width="10" height="10" viewBox="0 0 12 12" fill={i < review.rating ? '#f59e0b' : '#e5e7eb'}>
                          <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.93L6 8.89 2.48 10.85l.67-3.93L.3 4.14l3.94-.57z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] leading-[1.4] line-clamp-3" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {review.text}
                  </p>
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {formatDate(review.created_at)}
                  </p>
                </div>
              ))}
            </div>
            <div className="storex-divider -mx-4 my-4" />
          </>
        )}

        {/* Similar products */}
        {product.similar_products && product.similar_products.length > 0 && (
          <>
            <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              O'xshash mahsulotlar
            </h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {product.similar_products.map((p) => (
                <div key={p.id} className="min-w-[150px] max-w-[150px] shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom action bar (non-Telegram fallback) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex gap-2"
        style={{
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderTop: '0.5px solid var(--storex-border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          className="flex-1 py-3 text-[14px] font-semibold press-effect flex items-center justify-center gap-1.5"
          style={{
            border: '1.5px solid var(--storex-primary)',
            borderRadius: 'var(--storex-radius-md)',
            color: 'var(--storex-primary)',
            backgroundColor: 'var(--tg-theme-bg-color)',
          }}
          onClick={handleAddToCart}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {justAdded ? 'Qo\'shildi' : inCart ? 'Savatda' : 'Savatga'}
        </button>
        <button
          className="flex-1 py-3 text-[14px] font-semibold press-effect"
          style={{
            backgroundColor: 'var(--storex-primary)',
            borderRadius: 'var(--storex-radius-md)',
            color: '#fff',
          }}
          onClick={() => {
            if (!inCart) handleAddToCart();
            navigate('/checkout');
          }}
        >
          Sotib olish · {formatPrice(currentPrice)}
        </button>
      </div>
    </div>
  );
}

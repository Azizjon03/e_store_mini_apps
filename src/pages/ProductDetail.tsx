import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductDetail } from '@/api/storefront';
import { formatPrice, formatDate, t } from '@/lib/format';
import { useCartStore, makeItemId } from '@/store/cartStore';
import { useHaptic } from '@/hooks/useHaptic';
import { useBackButton } from '@/hooks/useBackButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Chip } from '@/components/ui/Chip';
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
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

  // A variant is one entry of the product's own `variants` array — a single
  // list of named options, not a type/value matrix. Nothing to select means
  // the product stays immediately buyable.
  const variants = product?.variants ?? [];
  const needsVariant = variants.length > 0 && !selectedVariant;

  // Must go through makeItemId: variant ids are 0-based, and a hand-built key
  // disagrees with the store's for id 0.
  const cartItemId = product ? makeItemId(product.id, selectedVariant?.id) : null;
  const inCart = cartItems.find((i) => i.id === cartItemId);

  // `variant.price` is what checkout charges; base + extra_price is the
  // fallback for a variant that carries no price of its own.
  const currentPrice = product
    ? selectedVariant
      ? selectedVariant.price ?? product.price + (selectedVariant.extra_price ?? 0)
      : product.price
    : 0;

  // `old_price` / `discount_percent` describe the *base* product's price,
  // not any variant's — `ProductVariant` (src/api/types.ts) carries no
  // `old_price` of its own, so there's no honest "before" price to compare
  // a variant's current price against. Once a selected variant changes what
  // "currentPrice" actually is, the base discount no longer describes it —
  // show the strike-through/badge only while the displayed price still
  // matches the base product's own price.
  const showBaseDiscount = currentPrice === product?.price;

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (needsVariant) return;
    if (inCart) {
      navigate('/cart');
      return;
    }
    addItem(product, 1, selectedVariant);
    haptic.impact('medium');
    setJustAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setJustAdded(false), 1500);
  }, [product, needsVariant, inCart, addItem, selectedVariant, haptic, navigate]);

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
            style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-bg-color) 85%, transparent)', boxShadow: 'var(--storex-shadow-sm)' }}
            onClick={() => navigate(-1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex gap-2">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-bg-color) 85%, transparent)', boxShadow: 'var(--storex-shadow-sm)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isFavorite ? 'var(--storex-price-sale)' : 'color-mix(in srgb, var(--tg-theme-bg-color) 85%, transparent)', boxShadow: 'var(--storex-shadow-sm)' }}
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
                  // Sits on the page background, not on the photo, so a fixed
                  // black dot disappears in dark mode.
                  backgroundColor:
                    i === currentImage
                      ? 'var(--storex-primary)'
                      : 'color-mix(in srgb, var(--tg-theme-text-color) 20%, transparent)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 pt-5 pb-28">
        <h1
          className="text-[20px] font-bold leading-snug mb-2"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {t(product.name)}
        </h1>

        {(product.reviews_count ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 12 12" fill={i < Math.round(product.reviews_avg_rating ?? 0) ? 'var(--storex-warning)' : 'var(--tg-theme-hint-color)'}>
                  <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.93L6 8.89 2.48 10.85l.67-3.93L.3 4.14l3.94-.57z" />
                </svg>
              ))}
            </div>
            <span className="text-[13px] font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
              {(product.reviews_avg_rating ?? 0).toFixed(1)}
            </span>
            <span className="text-[13px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
              ({product.reviews_count} ta sharh)
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mb-5">
          <span className="text-[24px] font-extrabold leading-none" style={{ color: 'var(--storex-primary)' }}>
            {formatPrice(currentPrice)}
          </span>
          {product.old_price && showBaseDiscount && (
            <span className="text-[14px] line-through" style={{ color: 'var(--storex-price-old)' }}>
              {formatPrice(product.old_price)}
            </span>
          )}
          {discountPercent > 0 && showBaseDiscount && (
            <span
              className="px-2 py-0.5 text-[11px] font-bold text-white"
              style={{
                backgroundColor: 'var(--storex-price-sale)',
                borderRadius: 'var(--storex-radius-xs)',
              }}
            >
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Variants — one group, one selection, labelled by variant.name */}
        {variants.length > 0 && (
          <div className="mb-5">
            <p className="text-[14px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Turini tanlang
            </p>
            <div className="flex gap-2 flex-wrap">
              {variants.map((v) => (
                <Chip
                  key={v.id}
                  active={selectedVariant?.id === v.id}
                  onClick={() => {
                    haptic.selectionChanged();
                    setSelectedVariant(v);
                  }}
                >
                  {v.name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className="storex-divider -mx-4 my-4" />

        {/* Description */}
        {(product.full_description || product.description) && (
          <>
            <button
              type="button"
              className="flex items-center justify-between w-full cursor-pointer mb-2.5 press-effect"
              onClick={() => setDescExpanded(!descExpanded)}
            >
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
                Tavsif
              </h3>
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-hint-color)" strokeWidth="2"
                style={{ transform: descExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {descExpanded && (
              <p className="text-[14px] leading-[1.55] mb-2" style={{ color: 'var(--tg-theme-text-color)', opacity: 0.8 }}>
                {t(product.full_description || product.description)}
              </p>
            )}
            <div className="storex-divider -mx-4 my-5" />
          </>
        )}

        {/* Attributes / Specs — always the base product's own spec. The API
            gives a variant only a `name` (src/api/types.ts, `ProductVariant`),
            no per-variant attribute map, so there's no reliable way to know
            which rows a selected variant would actually change (parsing
            `variant.name` against attribute values would be a guess, not
            data). Labelling it honestly beats silently guessing which rows
            to hide. */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <>
            <h3
              className={`text-[16px] font-bold ${variants.length > 0 ? 'mb-1' : 'mb-3'}`}
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              Xususiyatlari
            </h3>
            {variants.length > 0 && (
              <p className="text-[13px] mb-3" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Asosiy model xususiyatlari — tanlangan tur uchun farq qilishi mumkin
              </p>
            )}
            <div
              className="overflow-hidden mb-4"
              style={{ borderRadius: 'var(--storex-radius-md)' }}
            >
              {Object.entries(product.attributes).map(([key, value], i) => (
                <div
                  key={key}
                  className="flex justify-between px-3.5 py-3 text-[13px]"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-bg-color)',
                  }}
                >
                  <span style={{ color: 'var(--tg-theme-hint-color)' }}>{key}</span>
                  <span className="font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="storex-divider -mx-4 my-5" />
          </>
        )}

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <>
            <div className="storex-section-header px-0! mb-3">
              <h3 className="storex-section-title text-[16px]">
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
                        <svg key={i} width="10" height="10" viewBox="0 0 12 12" fill={i < review.rating ? 'var(--storex-warning)' : 'var(--tg-theme-hint-color)'}>
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
            <div className="storex-divider -mx-4 my-5" />
          </>
        )}

        {/* Similar products */}
        {product.similar_products && product.similar_products.length > 0 && (
          <>
            <h3 className="text-[16px] font-bold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              O'xshash mahsulotlar
            </h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {product.similar_products.map((p) => (
                <div key={p.id} className="min-w-40 max-w-40 shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom action bar (non-Telegram fallback) — bitta sticky CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3"
        style={{
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderTop: '0.5px solid var(--storex-border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {inCart ? (
          // Savatda bo'lsa: qty stepper + "Savatga o'tish"
          <div className="flex items-center gap-2">
            <QuantityStepper
              value={inCart.quantity}
              onDecrement={() => {
                const cartStore = useCartStore.getState();
                if (inCart.quantity > 1) {
                  cartStore.updateQuantity(inCart.id, inCart.quantity - 1);
                  haptic.selectionChanged();
                } else {
                  cartStore.removeItem(inCart.id);
                  haptic.impact('light');
                }
              }}
              onIncrement={() => {
                useCartStore.getState().updateQuantity(inCart.id, inCart.quantity + 1);
                haptic.selectionChanged();
              }}
            />
            <button
              className="flex-1 py-3 text-[14px] font-semibold press-effect"
              style={{
                backgroundColor: 'var(--storex-primary)',
                borderRadius: 'var(--storex-radius-md)',
                color: '#fff',
              }}
              onClick={() => navigate('/cart')}
            >
              Savatga o'tish
            </button>
          </div>
        ) : (
          // Savatda emas: bitta katta CTA
          <button
            className="w-full py-3.5 text-[15px] font-semibold press-effect flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--storex-primary)',
              borderRadius: 'var(--storex-radius-md)',
              color: '#fff',
            }}
            disabled={product.in_stock === false || needsVariant}
            onClick={handleAddToCart}
          >
            {product.in_stock === false ? (
              'Hozirda mavjud emas'
            ) : needsVariant ? (
              'Turini tanlang'
            ) : justAdded ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Qo'shildi
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Savatga qo'shish · {formatPrice(currentPrice)}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

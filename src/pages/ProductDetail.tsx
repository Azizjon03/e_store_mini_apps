import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductDetail } from '@/api/storefront';
import { formatPrice, formatDate, t } from '@/lib/format';
import { useCartStore, makeItemId } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';
import { useHaptic } from '@/hooks/useHaptic';
import { useBackButton } from '@/hooks/useBackButton';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';
import { showToast } from '@/lib/toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { NetworkError } from '@/components/ui/NetworkError';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Chip } from '@/components/ui/Chip';
import { useFavorite } from '@/hooks/useFavorite';
import { cn } from '@/lib/cn';
import type { ProductVariant } from '@/api/types';

export default function ProductDetail() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const storeConfig = useAppStore((s) => s.storeConfig);

  useBackButton();

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [descExpanded, setDescExpanded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  // Transient attention cue for the CTA-gates-to-variant flow below — cleared
  // by the same timer-ref + effect-cleanup pattern as `justAdded`.
  const [variantHighlight, setVariantHighlight] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const variantHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touchStartX = useRef(0);
  const variantSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
      if (variantHighlightTimerRef.current) clearTimeout(variantHighlightTimerRef.current);
    };
  }, []);

  const { data: product, isLoading, isError, refetch } = useQuery({
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

  // `product.price` is declared `number` in src/api/types.ts, but the
  // backend casts it `decimal:2` and Laravel serializes decimal casts as a
  // numeric STRING ("14990000.00", confirmed against the live API) — while
  // `variant.price` inside the same response is a plain JSON number. Without
  // normalizing both to `Number(...)`, a variant priced identically to the
  // base product (e.g. "14990000" vs "14990000.00") compared unequal below
  // just from the type mismatch, not an actual price difference.
  const basePrice = product ? Number(product.price) : 0;

  // `variant.price` is what checkout charges; base + extra_price is the
  // fallback for a variant that carries no price of its own.
  const currentPrice = product
    ? selectedVariant
      ? selectedVariant.price ?? basePrice + (selectedVariant.extra_price ?? 0)
      : basePrice
    : 0;

  // `old_price` / `discount_percent` describe the *base* product's price,
  // not any variant's — `ProductVariant` (src/api/types.ts) carries no
  // `old_price` of its own, so there's no honest "before" price to compare
  // a variant's current price against. Once a selected variant changes what
  // "currentPrice" actually is, the base discount no longer describes it —
  // show the strike-through/badge only while the displayed price still
  // matches the base product's own price (comparing against `basePrice`,
  // not the raw `product.price` string, is what makes that comparison
  // actually work — see basePrice above).
  const showBaseDiscount = currentPrice === basePrice;

  // The API sends the base "before" price as `compare_price`; `old_price` is
  // declared on the `Product` type but the backend never populates it (see
  // ProductCard, which already reads `product.old_price || product.compare_price`
  // for the same reason). Reading `old_price` alone here meant the
  // strike-through price never rendered at all.
  const oldPrice = product?.old_price || product?.compare_price;

  const discountPercent = product?.discount_percent || product?.discount_percentage || 0;

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

  // The CTA no longer disables itself while a variant is unpicked — it gates
  // instead: scroll the (already-rendered, since needsVariant implies
  // variants.length > 0) picker into view and briefly highlight it.
  const handlePrimaryCtaClick = useCallback(() => {
    if (needsVariant) {
      haptic.selectionChanged();
      variantSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setVariantHighlight(true);
      if (variantHighlightTimerRef.current) clearTimeout(variantHighlightTimerRef.current);
      variantHighlightTimerRef.current = setTimeout(() => setVariantHighlight(false), 900);
      return;
    }
    handleAddToCart();
  }, [needsVariant, handleAddToCart, haptic]);

  const handleShare = useCallback(() => {
    if (!product) return;
    const url = window.location.href;
    if (isTelegramWebApp) {
      WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}`);
      return;
    }
    if (navigator.share) {
      navigator.share({ url, title: t(product.name) }).catch(() => {});
      return;
    }
    navigator.clipboard
      ?.writeText(url)
      .then(() => showToast('success', 'Havola nusxalandi'))
      .catch(() => {});
  }, [product]);

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

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'var(--tg-theme-bg-color)' }} className="min-h-screen">
        <Skeleton className="w-full h-[216px] rounded-none" />
        <div className="p-4 flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-[52px] w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <NetworkError onRetry={() => refetch()} />;
  }

  if (!product) return null;

  // Both inlined objects on GET /products/{slug} (confirmed against the live
  // API) but not on the base Product — see src/api/types.ts.
  const brand = product.brand;
  const category = product.category;

  // "Fakt qatori" — rendered as at most one line, per the design's own
  // overflow measurement at 13px/328px. `reviews_avg_rating` / `stock_quantity`
  // may be entirely absent (not 0), so every read below goes through `??` /
  // `!== undefined`, never truthiness.
  const reviewsCount = product.reviews_count ?? 0;
  const hasRating = reviewsCount > 0;
  const stockQty = product.stock_quantity;
  const outOfStock = product.in_stock === false;
  const lowStock = !outOfStock && stockQty !== undefined && stockQty > 0 && stockQty < 15;
  const stockLabel = outOfStock ? 'Mavjud emas' : lowStock ? `Oxirgi ${stockQty} ta` : 'Sotuvda';
  const stockColor = outOfStock
    ? 'var(--storex-price-sale)'
    : lowStock
      ? 'var(--storex-warning)'
      : 'var(--tg-theme-hint-color)';

  // Same defensive `?? 0` guard as Checkout.tsx's `deliveryFeeFor` — the demo
  // store's /init returns delivery_info: {free_delivery_from: 0, min_order_amount: 0,
  // delivery_cost: 0}, so an unset threshold must never read as "free delivery".
  const deliveryInfo = storeConfig?.delivery_info;
  const freeDeliveryFrom = deliveryInfo?.free_delivery_from ?? 0;
  const deliveryCost = deliveryInfo?.delivery_cost ?? 0;
  const showDeliveryStrip = freeDeliveryFrom > 0 || deliveryCost > 0;

  return (
    <div style={{ backgroundColor: 'var(--tg-theme-bg-color)' }} className="min-h-screen">
      {/* Media band — fixed 216px gallery when there are images, otherwise a
          plain 48px top bar carrying the same three controls. No aspect-square:
          on this demo dataset (no product images at all) that burned 56% of
          the 640px viewport for nothing. */}
      {images.length > 0 ? (
        <div
          className="relative w-full h-[216px] overflow-hidden"
          style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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

          <div className="absolute top-0 left-0 right-0 p-3 z-10">
            <MediaOverlayControls
              variant="overlay"
              isFavorite={isFavorite}
              onBack={() => navigate(-1)}
              onShare={handleShare}
              onToggleFavorite={toggleFavorite}
            />
          </div>

          {images.length > 1 && (
            <div
              className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
            >
              {currentImage + 1}/{images.length}
            </div>
          )}

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
      ) : (
        <div className="relative w-full h-12" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
          <MediaOverlayControls
            variant="bar"
            isFavorite={isFavorite}
            onBack={() => navigate(-1)}
            onShare={handleShare}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      )}

      {/* Product Info */}
      <div className="px-4 pt-5 pb-28">
        {/* Brand · kategoriya */}
        {(brand?.name || category) && (
          <div className="flex items-center gap-2 mb-2">
            {brand?.name && (
              <span
                className="px-2 py-1 text-[11px] font-medium"
                style={{
                  borderRadius: 'var(--storex-radius-full)',
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                }}
              >
                {brand.name}
              </span>
            )}
            {brand?.name && category && (
              <span className="text-[11px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
                ·
              </span>
            )}
            {category && (
              <button
                type="button"
                className="text-[11px] font-medium"
                style={{ color: 'var(--storex-primary)' }}
                onClick={() => navigate(`/catalog/${category.slug}`)}
              >
                {t(category.name)}
              </button>
            )}
          </div>
        )}

        <h1
          className="text-[22px] font-bold leading-tight line-clamp-2 mb-2"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {t(product.name)}
        </h1>

        {/* Price block — deliberately two rows, not one.
            An Uzbek price is long: formatPrice(17990000) is "17 990 000 so'm",
            ~186px at 24px/800. Adding the struck compare_price (~90px at 14px)
            and the discount badge (~40px) to the same flex row overflows the
            328px content width at 360px, and the row wraps mid-price — "so'm"
            drops to its own line under both numbers, which reads as broken
            rather than as a discount. So: the current price and the badge share
            row one (186 + 8 + 40 = 234px, comfortable), and the "before" price
            sits beneath. Both prices carry `whitespace-nowrap` so neither can
            ever split between the digits and the currency word. */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[24px] font-extrabold leading-none whitespace-nowrap"
              style={{ color: 'var(--storex-primary)' }}
            >
              {formatPrice(currentPrice)}
            </span>
            {discountPercent > 0 && showBaseDiscount && (
              <span
                className="px-2 py-1 text-[10px] font-bold uppercase shrink-0"
                style={{
                  backgroundColor: 'var(--storex-price-sale)',
                  borderRadius: 'var(--storex-radius-xs)',
                  color: '#fff',
                }}
              >
                -{discountPercent}%
              </span>
            )}
          </div>
          {oldPrice && showBaseDiscount && (
            <span
              className="mt-1 block text-[14px] line-through whitespace-nowrap"
              style={{ color: 'var(--storex-price-old)' }}
            >
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>

        {/* Fakt qatori — one line. The parenthetical review count is dropped
            whenever the low-stock phrase renders alongside it: measured
            overflow at "★ 3.5 (4 ta sharh) · Oxirgi 3 ta" at 328px/13px. */}
        <div className="flex items-center flex-wrap gap-2 mb-4 text-[13px]">
          {hasRating && (
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    fill={i < Math.round(product.reviews_avg_rating ?? 0) ? 'var(--storex-warning)' : 'var(--tg-theme-hint-color)'}
                  >
                    <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.93L6 8.89 2.48 10.85l.67-3.93L.3 4.14l3.94-.57z" />
                  </svg>
                ))}
              </div>
              <span className="font-medium" style={{ color: 'var(--tg-theme-text-color)' }}>
                {(product.reviews_avg_rating ?? 0).toFixed(1)}
              </span>
              {!lowStock && (
                <span style={{ color: 'var(--tg-theme-hint-color)' }}>({reviewsCount} ta sharh)</span>
              )}
            </div>
          )}
          {hasRating && (
            <span style={{ color: 'var(--tg-theme-hint-color)' }}>·</span>
          )}
          <span style={{ color: stockColor }}>{stockLabel}</span>
        </div>

        {/* Variants — one group, one selection, labelled by variant.name.
            Horizontally scrolling by design: real variant names run
            18-22 characters and produce ~190px chips, so a wrapping cloud
            stacks nearly one per row (204px+ at 4 variants) and pushes this
            below the fold. A horizontal rail costs ~52px regardless of
            variant count. */}
        {variants.length > 0 && (
          <div ref={variantSectionRef} className={cn('mb-5', variantHighlight && 'heart-pop')}>
            <p className="text-[14px] font-semibold mb-3" style={{ color: 'var(--tg-theme-text-color)' }}>
              Turini tanlang{variants.length > 1 ? ` (${variants.length} ta)` : ''}
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {variants.map((v) => (
                <Chip
                  key={v.id}
                  active={selectedVariant?.id === v.id}
                  className="shrink-0"
                  onClick={() => {
                    haptic.selectionChanged();
                    setSelectedVariant(v);
                  }}
                >
                  <span className="flex flex-col items-start">
                    <span>{v.name}</span>
                    {v.extra_price !== undefined && v.extra_price > 0 && (
                      <span className="text-[11px]" style={{ opacity: 0.7 }}>
                        +{formatPrice(v.extra_price)}
                      </span>
                    )}
                  </span>
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Yetkazib berish — below the picker so an empty one costs nothing
            above the fold. Hidden entirely when the store has no free-delivery
            threshold and no delivery fee configured (this demo store's /init
            returns free_delivery_from: 0, delivery_cost: 0 — that is correct,
            not a bug). */}
        {showDeliveryStrip && (
          <div
            className="flex items-center gap-2 p-3 mb-5"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)', borderRadius: 'var(--storex-radius-md)' }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0" style={{ color: 'var(--storex-primary)' }}>
              <path d="M1 3h11v9H1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M12 7h3l3 3v2h-6V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <circle cx="5" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="15" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <div className="flex flex-col gap-1">
              {freeDeliveryFrom > 0 && (
                <p className="text-[13px]" style={{ color: 'var(--tg-theme-text-color)' }}>
                  {formatPrice(freeDeliveryFrom)} dan yuqori xaridlarga yetkazib berish bepul
                </p>
              )}
              {deliveryCost > 0 && (
                <p className="text-[13px]" style={{ color: 'var(--tg-theme-text-color)' }}>
                  Yetkazib berish: {formatPrice(deliveryCost)}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="storex-divider -mx-4 my-4" />

        {/* Attributes / Specs — always the base product's own spec, expanded
            (no toggle). The API gives a variant only a `name`
            (src/api/types.ts, `ProductVariant`), no per-variant attribute map,
            so there's no reliable way to know which rows a selected variant
            would actually change (parsing `variant.name` against attribute
            values would be a guess, not data). Labelling it honestly beats
            silently guessing which rows to hide. */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <>
            <h3 className={cn('storex-section-title', variants.length > 0 ? 'mb-1' : 'mb-3')}>
              Xususiyatlari
            </h3>
            {variants.length > 0 && (
              <p className="text-[13px] mb-3" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Asosiy model xususiyatlari — tanlangan tur uchun farq qilishi mumkin
              </p>
            )}
            <div className="overflow-hidden mb-4" style={{ borderRadius: 'var(--storex-radius-md)' }}>
              {Object.entries(product.attributes).map(([key, value], i) => (
                <div
                  key={key}
                  className="flex justify-between px-4 py-3 text-[13px]"
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

        {/* Description — expanded by default (clamped to 3 lines), not hidden
            behind an accordion: it's the main reason someone opened the page. */}
        {(product.full_description || product.description) && (
          <>
            <h3 className="storex-section-title mb-3">Tavsif</h3>
            <p
              className={cn('text-[14px] leading-[1.55] mb-2', !descExpanded && 'line-clamp-3')}
              style={{ color: 'var(--tg-theme-text-color)', opacity: 0.8 }}
            >
              {t(product.full_description || product.description)}
            </p>
            <button
              type="button"
              className="text-[13px] font-medium press-effect"
              style={{ color: 'var(--storex-primary)' }}
              onClick={() => setDescExpanded(!descExpanded)}
            >
              {descExpanded ? "Yig'ish" : 'Batafsil'}
            </button>
            <div className="storex-divider -mx-4 my-5" />
          </>
        )}

        {/* Reviews — the API sends at most the 3 newest approved ones, and only
            on this detail endpoint (the catalog list omits the key entirely to
            avoid an N+1). Older responses didn't send `reviews` at all, which is
            why `ProductDetail.reviews` is optional and why this stays guarded
            rather than assuming an array. No "Hammasi" button: the paginated
            endpoint exists server-side, but there is no reviews screen in the
            router yet to route to. */}
        {product.reviews && product.reviews.length > 0 && (
          <>
            <h3 className="storex-section-title mb-3">
              Sharhlar ({reviewsCount || product.reviews.length})
            </h3>
            <div className="flex flex-col gap-3 mb-4">
              {product.reviews.slice(0, 2).map((review) => (
                <div
                  key={review.id}
                  className="p-3"
                  style={{
                    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                    borderRadius: 'var(--storex-radius-md)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
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
                    <div className="flex gap-1">
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
                  <p className="text-[11px] mt-2" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {formatDate(review.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom action bar (non-Telegram fallback) — bitta sticky CTA */}
      <div
        // `fixed` escapes AppShell's column, so this carries the same cap as
        // TabBar and SubmitBar. Without it the bar — and its tap area — spanned
        // the whole desktop window: a click 400px outside the column still
        // added to the cart.
        className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 mx-auto max-w-(--storex-app-max-width)"
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
                color: 'var(--tg-theme-button-text-color)',
              }}
              onClick={() => navigate('/cart')}
            >
              Savatga o'tish
            </button>
          </div>
        ) : (
          // Savatda emas: bitta katta CTA. Variant tanlanmagan bo'lsa ham
          // disabled emas — bosilganda variant qatoriga scroll qiladi.
          <button
            className="w-full py-4 text-[15px] font-semibold press-effect flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--storex-primary)',
              borderRadius: 'var(--storex-radius-md)',
              color: 'var(--tg-theme-button-text-color)',
            }}
            disabled={product.in_stock === false}
            onClick={handlePrimaryCtaClick}
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

/**
 * Back / share / favourite controls shared by both media-band branches
 * (image gallery overlay vs. no-image top bar) — same private-helper-below-
 * default-export idiom as PaymentIcon in Checkout.tsx.
 *
 * Visual circle stays 36px in both variants; the button itself is 48×48
 * (DESIGN_STANDARD.md §8 tap-target minimum) via flex-centering a smaller
 * inner circle rather than an arbitrary (non-4px-grid) padding value.
 */
function MediaOverlayControls({
  variant,
  isFavorite,
  onBack,
  onShare,
  onToggleFavorite,
}: {
  variant: 'overlay' | 'bar';
  isFavorite: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
}) {
  // "overlay" sits on top of an arbitrary photo and needs a translucent
  // scrim to stay legible; "bar" sits on the page's own solid background,
  // where the same translucent bg-color mix would be invisible, so it gets
  // a tonal (secondary-bg) fill instead.
  const idleBg =
    variant === 'overlay'
      ? 'color-mix(in srgb, var(--tg-theme-bg-color) 85%, transparent)'
      : 'var(--tg-theme-secondary-bg-color)';
  const shadow = variant === 'overlay' ? 'var(--storex-shadow-sm)' : 'none';

  return (
    <div className="flex items-center justify-between w-full h-full">
      <button type="button" aria-label="Orqaga" className="w-12 h-12 flex items-center justify-center shrink-0" onClick={onBack}>
        <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: idleBg, boxShadow: shadow }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </span>
      </button>

      <div className="flex items-center shrink-0">
        <button type="button" aria-label="Ulashish" className="w-12 h-12 flex items-center justify-center" onClick={onShare}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: idleBg, boxShadow: shadow }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </span>
        </button>
        <button type="button" aria-label="Sevimlilarga qo'shish" className="w-12 h-12 flex items-center justify-center" onClick={onToggleFavorite}>
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: isFavorite ? 'var(--storex-price-sale)' : idleBg, boxShadow: shadow }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? '#fff' : 'none'} stroke={isFavorite ? '#fff' : 'var(--tg-theme-text-color)'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

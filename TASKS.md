# E-Store Telegram Mini App — Implementation Tasks

## Session 1: Phase 1–4 (Foundation + Home Page)

### Phase 1: Project Setup
- [x] Install runtime dependencies (react-router-dom, zustand, @tanstack/react-query, axios, @twa-dev/sdk)
- [x] Install dev dependencies (tailwindcss, @tailwindcss/vite, clsx, tailwind-merge)
- [x] Configure Tailwind CSS (vite plugin + global.css)
- [x] Configure Vite path alias (`@/` → `src/`)
- [x] Configure tsconfig paths
- [x] Create `.env` with `VITE_API_BASE_URL`
- [x] Create directory structure

### Phase 2: Core Infrastructure
- [x] TypeScript types (`src/api/types.ts`)
- [x] Axios API client with interceptors (`src/api/client.ts`)
- [x] Storefront API functions (`src/api/storefront.ts`)
- [x] Auth Zustand store (`src/store/authStore.ts`)
- [x] Cart Zustand store (`src/store/cartStore.ts`)
- [x] App Zustand store (`src/store/appStore.ts`)
- [x] Telegram helpers (`src/lib/telegram.ts`)
- [x] Telegram hooks (useTelegram, useBackButton, useMainButton, useHaptic)
- [x] Utility: cn() class merge (`src/lib/cn.ts`)
- [x] Utility: formatPrice, formatDate (`src/lib/format.ts`)
- [x] Toast utility (`src/lib/toast.ts`)

### Phase 3: Layout & Navigation
- [x] React Router config with lazy routes (`src/app/router.tsx`)
- [x] Providers: QueryClient, BrowserRouter, Telegram init (`src/app/providers.tsx`)
- [x] PageLayout component
- [x] TabBar (bottom navigation with 4 tabs + cart badge)
- [x] SearchBar (sticky, navigates to /search)
- [x] UI: Skeleton, Spinner, Badge, EmptyState, Toast, BottomSheet, LazyPage
- [x] App entry point (`src/app/App.tsx`, updated `src/main.tsx`)

### Phase 4: Home Page
- [x] HeroBanner (swipeable, auto-play, dots)
- [x] CategoryChips (horizontal scroll)
- [x] ProductCard (image, title, price, discount, add-to-cart)
- [x] ProductGrid (2-column CSS grid)
- [x] ProductSection (header + "Barchasi" link + grid)
- [x] HomeSections (sale, new, popular sections)
- [x] Home page assembly

### Verification
- [x] `npm run build` passes
- [x] `npm run lint` passes
- [ ] Dev server renders correctly

---

## Session 2: Phase 5 — Catalog, Product Detail, Search
- [x] BottomSheet filter component (`src/components/ui/BottomSheet.tsx`)
- [x] useInfiniteProducts hook (`src/hooks/useInfiniteProducts.ts`)
- [x] Catalog page with infinite scroll, category chips, sort, filter bottom sheet
- [x] Product detail page (gallery, variants, attributes, reviews, similar products, MainButton)
- [x] Search page (debounce 300ms, recent history, popular searches, results grid)
- [x] Cart page (quantity controls, price breakdown, MainButton)
- [x] Profile page (user info, menu items)
- [x] Placeholder pages for: Checkout, Orders, OrderDetail, Addresses, AddressForm, OrderSuccess

### Verification
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Session 3: Phase 6 — Cart & Checkout
- [x] Cart page promo code integration (API: apply/remove promo, success/error messages)
- [x] Checkout page (address selection, delivery method, payment method, notes, MainButton)
- [x] Order success page with order number and navigation

## Session 4: Phase 7 — Orders & Profile
- [x] Orders list page (status badges, product thumbnails, skeleton loading)
- [x] Order detail page (status timeline, tracking, reorder, support button)
- [x] Addresses page (list, edit, delete with confirm dialog)
- [x] Address form page (create/edit with label chips, primary toggle, MainButton)

### Verification
- [x] `npm run build` passes (173 modules, proper code-splitting)
- [x] `npm run lint` passes

---

## Session 5: Phase 8 — Favorites, Error Handling, Polish
- [x] Favorites page (`src/pages/Favorites.tsx`) — list, remove, add to cart
- [x] `useFavorite` hook (`src/hooks/useFavorite.ts`) — toggle with optimistic query invalidation
- [x] Favorite heart toggle on ProductCard (top-right of image)
- [x] Favorite heart toggle on ProductDetail (top-right of gallery)
- [x] Profile menu: Sevimlilar now links to `/favorites`
- [x] ErrorBoundary component (`src/components/ui/ErrorBoundary.tsx`)
- [x] NetworkError component (`src/components/ui/NetworkError.tsx`)
- [x] ErrorBoundary wraps entire app in `providers.tsx`
- [x] PullToRefresh component + `usePullToRefresh` hook
- [x] Pull-to-refresh on Home page
- [x] Page fade-in transition animation (LazyPage wrapper)
- [x] Heart pop animation CSS

### Verification
- [x] `npm run build` passes (178 modules, proper code-splitting)
- [x] `npm run lint` passes

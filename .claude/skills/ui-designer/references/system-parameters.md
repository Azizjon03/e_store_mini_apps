# StoreX — design system parameters

Static passport of this project's UI. Read this before judging whether any external
design reference fits. Every rule here is a hard constraint unless the user
explicitly overrides it.

Companion document: `DESIGN_STANDARD.md` in the repo root carries the measurable
visual rules (spacing grid, radius/typography scales, per-component dimensions).
This file carries the *technical* reality — what exists in code, what the API
returns, and what the runtime does to you.

## Platform — this is not a website

A Telegram Mini App running inside Telegram's WebView, plus a plain-browser
fallback that must keep working (`isTelegramWebApp` gates every WebApp call).

- **Mobile portrait only.** Design against **360×640** as the floor, not a modern
  flagship. Telegram's header eats vertical space above your viewport.
- **The bottom is expensive.** The tab bar permanently occupies
  `56px + env(safe-area-inset-bottom)` on tabbed screens. Telegram's `MainButton`
  can occupy more on top of that, and `SubmitBar` stacks above the tab bar via
  `aboveTabBar`. Any design with a floating bottom element must account for all three.
- **Telegram chrome is yours to use.** `MainButton` (primary action), `BackButton`
  (navigation), and haptics are free and native-feeling — but they only exist inside
  Telegram, so every screen still needs an in-page equivalent (this is why
  `SubmitBar` exists).
- **Thumb reach matters more than symmetry.** Primary actions belong in the lower
  half. Minimum tap target 48×48.

## Stack

- React 19 + TypeScript (strict, `noUnusedLocals`, `noUnusedParameters`) + Vite
- **Tailwind CSS v4** via `@tailwindcss/vite` — there is **no `tailwind.config.js`**.
  The theme lives in `@theme` and `:root` custom properties in `src/styles/global.css`
- React Router v7 (`createBrowserRouter`, lazy routes), TanStack Query v5, Zustand
  (persisted), axios, `@twa-dev/sdk`
- Alias `@/` → `src/`

## Available components

`src/components/ui/`: `Badge` (cart count bubble), `BottomSheet`, `Chip`
(wraps `.storex-chip` / `.storex-chip.active`), `EmptyState` (icon — emoji
string or a `ReactNode` — + title + optional action), `ErrorBoundary`,
`LazyPage`, `NetworkError`, `PullToRefresh`, `QuantityStepper` (48px targets,
optional trash icon at min), `RadioRow` (icon / title / subtitle / trailing /
selected), `Skeleton` + `ProductCardSkeleton`, `Spinner`, `SubmitBar`, `Toast`
(imperative via `showToast` from `@/lib/toast`).

`src/components/layout/`: `PageLayout` (search bar + main + tab bar), `SearchBar`
(sticky, primary-colored), `TabBar` (4 tabs: Asosiy `/`, Katalog `/catalog`,
Savat `/cart`, Profil `/profile`).

`src/components/product/`: `ProductCard`, `ProductGrid` (2-col), `ProductSection`.
`src/components/home/`: `HeroBanner`, `CategoryChips`, `HomeSections`.
`src/components/catalog/`: `FilterSheet` (price, rating, brands, attributes,
live result count).

Shared logic that is not a component lives in `src/lib/` — `catalogFilters`,
`address`, `payment`, `format`, `toast` — and in `src/hooks/` (`useDebounce`,
the Telegram bridges). `react-refresh/only-export-components` forbids exporting
a non-component from a component file, so a shared helper always goes there.

**Anything not on this list does not exist.** No tabs, accordion, modal, carousel
library, date picker, rating widget, segmented control, drawer, tooltip,
combobox. Proposing one means proposing new code — say so and estimate it.

## App shell width

Every route renders inside `AppShell` (`src/app/App.tsx`) — a centred column
capped at `--storex-app-max-width` (480px), with `--tg-theme-secondary-bg-color`
behind it. Below 480px the column is the full viewport, so the Telegram
rendering is unaffected. `fixed`/`absolute` chrome escapes that wrapper and
carries the same cap itself: `TabBar`, `SubmitBar`, `BottomSheet`. A new piece
of fixed chrome must do the same or it will span a desktop window.

## Icons — there is no icon library

`lucide-react`, `heroicons`, and every other icon package are **absent**.

Two mechanisms are in use today:
- **Hand-written inline SVG**, which is the dominant pattern (TabBar, SearchBar,
  ProductCard, BottomSheet, and most pages).
- **Material Symbols Outlined**, loaded as a webfont from Google Fonts in
  `index.html` and used only on `Profile.tsx` via `.material-symbols-outlined`.

A concept needing a large, consistent icon set is really proposing one of: hand-drawing
each SVG, spreading Material Symbols to more screens, or adding a dependency. Name
which one — don't let it stay implicit.

## Fonts

`Plus Jakarta Sans` (`.font-headline`), `Inter` (`.font-body`) and Material Symbols
load from Google Fonts in `index.html`; `--font-sans` falls back to the system stack.
These are external network requests inside a WebView on a mobile connection — a design
that depends on a font landing before it reads correctly is fragile. System font is
the safe default per `DESIGN_STANDARD.md` §4.

## Color rules

Tokens only, via `var(...)`. **Hardcoded hex is forbidden** (the sole exception is
`#fff` on an icon or a translucent overlay).

- Telegram theme, injected at runtime: `--tg-theme-bg-color`,
  `--tg-theme-secondary-bg-color`, `--tg-theme-text-color`, `--tg-theme-hint-color`,
  `--tg-theme-button-color`, `--tg-theme-button-text-color`, `--tg-theme-link-color`
- Brand: `--storex-primary` (derives from `--tg-theme-button-color`), plus
  `-light`, `-medium`, `-dark`, `--storex-gradient`
- Semantic: `--storex-success`, `--storex-warning`, `--storex-danger`, `--storex-info`,
  `--storex-price-sale`, `--storex-price-old`, `--storex-skeleton`
- Structure: `--storex-border`, `--storex-border-card`, `--storex-shadow-sm/md/lg/card`,
  `--storex-radius-xs/sm/md/lg/xl/full`, `--storex-space-1..8`,
  `--storex-page-padding` (16px), `--storex-tabbar-height` (56px)
- A `--stitch-*` set (Material-3 style neutrals) also exists in `global.css`, used by
  some newer screens. Don't mix the two systems inside one screen.

Reusable classes in `global.css`: `storex-card`, `storex-surface`, `storex-tonal`,
`storex-chip`, `storex-section`, `storex-section-header`, `storex-section-title`,
`storex-section-link`, `storex-divider`, `storex-glass`, `storex-gradient-text`,
`press-effect`, `page-enter`, `shimmer`, `scrollbar-hide`.

## Dark mode

There is **no `dark:` variant and no theme class** in this project. Dark mode arrives
purely through Telegram flipping `--tg-theme-*` to dark values. Consequences:

- Any surface painted with a literal white — including `storex-card`'s use of
  `--tg-theme-bg-color`, `storex-glass`'s `rgba(255,255,255,…)`, and the `#fff` text
  on primary buttons — must be checked against a dark background.
- `--storex-border` is **theme-relative**, not a fixed black:
  `color-mix(in srgb, var(--tg-theme-text-color) 12%, transparent)` (`global.css:38`),
  and `--storex-border-card` follows the same construction at 10%. Hairline borders
  therefore survive a dark palette — the variant chips on the product detail page
  were verified against a dark Telegram palette and keep their outlines. (This
  entry previously claimed the token was a hardcoded `rgba(0,0,0,0.08)`; that was
  stale. Trust `global.css`, not this file, if they ever disagree again.)

## Animation

No `framer-motion`, no animation library. What exists is CSS keyframes in
`global.css`: `skeleton-pulse`, `shimmer`, `badge-bounce`, `slide-up`, `fade-in`,
`toast-slide-down`, `page-fade-in`, `heart-pop`, `count-up`, `float-in`, plus
`press-effect`. `DESIGN_STANDARD.md` §9 caps every animation at 300ms.

## Charts

**No charting library.** Any reference with a graph, sparkline or gauge needs a
CSS-only substitute or an explicit new dependency.

## Data reality

`src/api/types.ts` is the contract; `src/api/storefront.ts` lists every endpoint.
Before a concept renders a field, confirm it appears there — and remember the backend
is a separate repo, so a missing field is a cross-repo change, not a quick edit.

Facts worth knowing up front:

- `Product` carries `reviews_avg_rating`, `reviews_count`, `in_stock`,
  `stock_quantity`, `discount_percent`, `compare_price`, `variants`, `attributes`
  — but most are **optional** and may simply be absent in a given response. Design
  the empty case, not just the full one. Two traps that have already cost a bug
  each: the average rating is `reviews_avg_rating`, never `rating`; and the
  "before" price arrives as `compare_price`, so a check against `old_price`
  alone is always false.
- A **variant** is `{id, name, sku?, price?, extra_price?, image?}` — one flat
  list of named options, *not* a type/value matrix. There is no colour value and
  no per-variant attribute map, so a swatch picker or a spec table that changes
  with the selection cannot be built from this data. `id` is the variant's
  0-based index, so it must never be tested for truthiness. Variant names in this
  catalogue are long (`"256GB Natural Titanium"` ≈ 190px as a chip), so a wrapping
  chip cloud costs ~50px *per variant*; the product detail page uses a single
  horizontally-scrolling rail instead, which is flat ~52px at any variant count.
- **The product detail endpoint returns almost the same resource as the list.**
  `GET /products/{slug}` additionally inlines `brand` (whose `name` is a **plain
  string**, unlike every other name in the API), `category` (localized), `tags`,
  and — since 2026-08-16 — up to the 3 newest approved `reviews`. It does **not**
  send `full_description` or `similar_products`; those were declared in `types.ts`
  for a long time while the backend never sent them, which is exactly the class of
  bug this document exists to prevent. Treat a declared field as real only after
  seeing it in a live response.
- `HomeData` = `banners`, optional `banners_mid`, `categories`, `sections`,
  optional `flash_sale`. The home page's structure is largely server-driven.
- `StoreConfig` (`GET /init`) supplies branding, `delivery_info`
  (`free_delivery_from`, `min_order_amount`, `delivery_cost`), `working_hours`,
  `pickup_points`, `social_links` — good raw material for trust and urgency signals.
- Localized fields arrive as `string | Record<string, string>` and must be rendered
  through `t()` from `@/lib/format`. Prices go through `formatPrice` (appends `so'm`).
  Money now arrives as real JSON numbers on every storefront endpoint — it used to
  be quoted (`"14990000.00"`, Laravel's `decimal:2` cast), which made `+` concatenate
  and `===` fail against a variant's numeric price. Admin-only resources still leak
  the string form, so do not assume it holds outside `storefront/*`.
- **The cart is client-side only** until checkout pushes it to the server. Any design
  implying server-side cart state (cross-device sync, saved-for-later, live stock
  re-check in the cart) is a backend change.
- Delivery cost is derived from `StoreConfig.delivery_info` and goes to zero for
  pickup. Pickup points are selectable at checkout, and the pickup option hides
  itself when the store has none configured.
- `BACKEND_TASKS.md` lists fields already requested from the backend — check it
  before declaring something impossible.

## Copy and i18n

- **All user-facing text is Uzbek, hardcoded in the JSX.** There is no i18n library and
  no translation files; `t()` only unwraps localized fields coming from the API.
- Uzbek runs roughly 30% longer than English. Check every tight space against the real
  Uzbek string: tab labels, buttons, badges, single-line truncation. "Savatga qo'shish"
  is not "Add to cart".
- Uzbek uses apostrophes constantly (`so'm`, `qo'shish`, `ko'ring`) — in JSX string
  literals that means escaping or double quotes.

## Performance

- Route-level code splitting via `lazy()` + `LazyPage`; keep new screens on that path.
- Product images come straight from the API with `loading="lazy"` and no CDN,
  no responsive `srcset`, no dominant-color placeholder. A concept built on
  full-bleed hero imagery is paying a real load cost on a mobile connection.
- React Query defaults: 5 min `staleTime`, `refetchOnWindowFocus: false`, `retry: 1`.
  Infinite scroll exists via `useInfiniteProducts`.

## Known gaps

Real defects found in the current code — worth folding into a redesign of the
affected area rather than treating as out of scope:

1. `App.tsx` gates the whole app behind a hardcoded "StoreX" welcome screen with
   inline styles that ignore the design tokens. It cannot show
   `StoreConfig.company_name`: `GET /init` only runs *after* the user taps
   "Kirish", so the name is not known yet. Fixing this means moving the fetch
   ahead of the gate, not just reading a field.
2. The favourite button on `ProductCard` is 28px — below the 48px tap-target
   minimum. Enlarging it changes the card's composition, so it is a design call.
3. `useMainButton` has no consumers. Telegram's MainButton did not render
   reliably, so every screen uses `SubmitBar` instead. Do not design a screen
   whose primary action lives on the native button.
4. The **running demo database has no product images at all** — `GET /products/{slug}`
   returns `images: []`, `image: null`, `thumbnail: null` for every product
   (verified 2026-08-16 against the live local API). Note the seeder
   (`ProductSeeder.php`) *does* generate picsum URLs, so the empty state is stale
   data, not the design target: a concept must look right **both** ways, and one
   that only looks good on the empty dataset is overfitting. The seeded attribute
   values are also near-unique free text (`6.8" Dynamic AMOLED 2X`), so tidy
   facets will look better in the mockup than in this store — though the
   *display* table (`attributes`) is clean, e.g. `{RAM: "8GB", Ekran: "6.7\"
   Super Retina XDR"}`.
5. `Favorites` and `AddressForm` still use raw emoji as controls (🗑 ✏️) while
   the rest of the app uses inline SVG, and `AddressForm` has no header or back
   control outside Telegram.

Closed since this file was written: the `Badge` token mismatch, the two parallel
token systems (`--stitch-*` is now defined in terms of `--tg-theme-*` /
`--storex-*`), and the hard-coded delivery cost.

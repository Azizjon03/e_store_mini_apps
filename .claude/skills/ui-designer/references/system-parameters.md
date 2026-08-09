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

`src/components/ui/`: `Badge` (cart count bubble), `BottomSheet`, `EmptyState`
(emoji + title + optional action), `ErrorBoundary`, `LazyPage`, `NetworkError`,
`PullToRefresh`, `Skeleton` + `ProductCardSkeleton`, `Spinner`, `SubmitBar`,
`Toast` (imperative via `showToast` from `@/lib/toast`).

`src/components/layout/`: `PageLayout` (search bar + main + tab bar), `SearchBar`
(sticky, primary-colored), `TabBar` (4 tabs: Asosiy `/`, Katalog `/catalog`,
Savat `/cart`, Profil `/profile`).

`src/components/product/`: `ProductCard`, `ProductGrid` (2-col), `ProductSection`.
`src/components/home/`: `HeroBanner`, `CategoryChips`, `HomeSections`.

**Anything not on this list does not exist.** No tabs, accordion, modal, carousel
library, date picker, rating widget, stepper, segmented control, drawer, tooltip,
combobox. Proposing one means proposing new code — say so and estimate it.

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
- `--storex-border` is `rgba(0,0,0,0.08)` — effectively invisible on a dark surface.
  A design that relies on hairline borders for structure will lose its structure in
  dark mode. Prefer tonal shifts (`--tg-theme-secondary-bg-color`) for separation.

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

- `Product` carries `rating`, `reviews_count`, `in_stock`, `stock_quantity`,
  `discount_percent`, `old_price`, `variants`, `attributes` — but most are **optional**
  and may simply be absent in a given response. Design the empty case, not just the
  full one.
- `HomeData` = `banners`, optional `banners_mid`, `categories`, `sections`,
  optional `flash_sale`. The home page's structure is largely server-driven.
- `StoreConfig` (`GET /init`) supplies branding, `delivery_info`
  (`free_delivery_from`, `min_order_amount`, `delivery_cost`), `working_hours`,
  `pickup_points`, `social_links` — good raw material for trust and urgency signals.
- Localized fields arrive as `string | Record<string, string>` and must be rendered
  through `t()` from `@/lib/format`. Prices go through `formatPrice` (appends `so'm`).
- **The cart is client-side only** until checkout pushes it to the server. Any design
  implying server-side cart state (cross-device sync, saved-for-later, live stock
  re-check in the cart) is a backend change.
- Delivery cost is currently hardcoded to 0 in `Checkout.tsx`. A design showing a
  real delivery fee needs that wired up first.
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

1. `Badge.tsx` reads `var(--store-badge-bg)` / `var(--store-badge-text)`, but
   `global.css` defines `--storex-badge-bg` / `--storex-badge-text`. The cart count
   bubble therefore renders with no background color.
2. `App.tsx` gates the whole app behind a hardcoded "StoreX" welcome screen with
   inline styles that ignore both the design tokens and `StoreConfig.company_name`.
3. Two parallel token systems (`--storex-*` and `--stitch-*`) coexist, so screens
   drift apart visually depending on which one they were built against.

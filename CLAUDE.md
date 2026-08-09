# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

StoreX — a Telegram Mini App storefront (React 19 + Vite + TypeScript) for a Laravel backend that lives in a separate repo (`e_store_back`). Single-company e-commerce: home, catalog, product detail, search, cart, checkout, orders, addresses, favorites. **All user-facing copy is in Uzbek.**

## Commands

```bash
npm run dev       # Vite dev server (allowedHosts: true — works behind ngrok/tunnels for Telegram testing)
npm run build     # tsc -b && vite build — type errors fail the build
npm run lint      # eslint .
npm run preview   # serve dist/
```

There is no test framework in this repo. "Verified" means `npm run build` and `npm run lint` both pass, plus manual checks in the browser or Telegram.

`.env` is gitignored; `VITE_API_BASE_URL` must point at the backend storefront prefix (e.g. `https://host/api/v1/storefront`) because every path in [src/api/storefront.ts](src/api/storefront.ts) is relative to it (`/init`, `/products`, `/auth/login`, …).

## Architecture

**Layering.** `src/api` (axios + typed endpoint functions) → `src/store` (zustand, persisted) → `src/hooks` (react-query + Telegram bridges) → `src/pages` / `src/components`. Path alias `@/` → `src/` (set in both [vite.config.ts](vite.config.ts) and [tsconfig.app.json](tsconfig.app.json)).

**Server state vs client state.** React Query owns everything fetched from the API (5 min staleTime, `refetchOnWindowFocus: false`, `retry: 1`). Zustand owns only local/persisted state: `authStore` (`storex-auth`), `cartStore` (`e-store-cart`), `appStore` (language + search history). A global `MutationCache.onError` in [src/app/providers.tsx](src/app/providers.tsx) shows a toast **only** when a mutation has no own `onError` — adding a local `onError` silently suppresses the global one.

**Auth is phone + password + Sanctum bearer token**, not Telegram initData (initData is used for prefill only). The token lives in `authStore` and is attached by a request interceptor. The response interceptor in [src/api/client.ts](src/api/client.ts) catches 401, calls `logout()`, and hard-redirects to `/login?next=<path>`. Route gating is [ProtectedRoute](src/components/ProtectedRoute.tsx), which redirects with the same `?next=` convention — preserve it when adding auth-required routes.

**The cart is client-side only until checkout.** `cartStore` never talks to the API during browsing. [src/pages/Checkout.tsx](src/pages/Checkout.tsx) pushes the whole local cart to the server (`clearCart()` then a loop of `addToCart`) immediately before `POST /checkout`, because the backend's `CheckoutController` reads its own server-side cart. Any change to cart shape or to how items are added must keep that sync loop correct. Note the id mismatch: local items key off numeric `product.id` (`makeItemId` → `"<productId>:<variantId>"`), while the API takes `product_id` as a string.

**Telegram integration degrades to a plain web app.** [src/lib/telegram.ts](src/lib/telegram.ts) exports `isTelegramWebApp`, and every hook (`useTelegram`, `useBackButton`, `useMainButton`, `useHaptic`) early-returns no-ops outside the WebView. Follow that pattern for any new WebApp API — the app must still run in a desktop browser. `useMainButton` deliberately registers its click handler once against a ref so re-renders don't re-register listeners.

**App shell.** [src/app/App.tsx](src/app/App.tsx) renders a `WelcomeScreen` gate first; `initTelegram()`, `GET /init` (store config), and `GET /auth/me` only run after the user taps "Kirish". Routes are all `lazy()` + wrapped in `LazyPage`, defined in [src/app/router.tsx](src/app/router.tsx) using `createBrowserRouter` — real paths, so any host must serve an SPA fallback.

**Localized API fields.** Names/descriptions come back as `string | Record<string, string>` (`LocalizedString`). Always render them through `t()` from [src/lib/format.ts](src/lib/format.ts), never directly. `formatPrice` appends `so'm`.

## Styling

Tailwind v4 through `@tailwindcss/vite` — there is **no `tailwind.config.js`**; the theme lives in `@theme` and `:root` custom properties in [src/styles/global.css](src/styles/global.css).

[DESIGN_STANDARD.md](DESIGN_STANDARD.md) is binding for UI work: 4px spacing grid (no `gap-1.5`/`py-2.5`), fixed radius/typography scales, 16px page padding, and colors **only** via `var(--storex-*)` / `var(--tg-theme-*)` tokens — no hard-coded hex. Telegram's theme vars drive the brand color, so the app must look right when they change. Read that file before adding or restyling components.

The base reset is wrapped in `@layer base` on purpose — un-layered `* { padding: 0 }` beats Tailwind v4 utilities and would break spacing project-wide.

## UI work

Any design or redesign of a screen goes through the project skill `ui-designer`
([.claude/skills/ui-designer/SKILL.md](.claude/skills/ui-designer/SKILL.md)) rather than being
improvised. It researches real shipped mobile-commerce screens via Lazyweb, audits what this
codebase and API can actually support, produces three structurally different concepts, verifies
each against real data, and presents one recommendation in Uzbek before anything gets built.

Three subagents back it: `ui-researcher` (Lazyweb references), `system-fit-auditor` (read-only
codebase reality check, also used to verify each concept), and `react-frontend-dev` (implements
the approved concept). [.claude/skills/ui-designer/references/system-parameters.md](.claude/skills/ui-designer/references/system-parameters.md)
is the technical passport — real component inventory, the fact that no icon/animation/chart
library is installed, Telegram layout constraints, and known token bugs. Keep it current when
the stack changes; the whole workflow trusts it.

## Deploy

Push to `main` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml): SSH to the server, `git pull`, `rm -rf dist`, `npm ci && npm run build`, then `docker compose up -d --force-recreate nginx` from the sibling `e_store_back` checkout. The force-recreate is required — nginx's bind mount otherwise keeps serving the deleted `dist` inode and returns 403. Don't drop that step.

## Reference docs

- [E-Store_Telegram_MiniApp_TZ.md](E-Store_Telegram_MiniApp_TZ.md) — full spec (Uzbek), including the complete backend endpoint table.
- [BACKEND_TASKS.md](BACKEND_TASKS.md) — API changes requested from the Laravel side; check here before assuming an endpoint or field exists.
- [TASKS.md](TASKS.md) — implementation progress log.

## Lazyweb routing vs `ui-designer`

The managed Lazyweb block below routes generic UI requests to the `lazyweb-*` skills. In **this**
repo, `ui-designer` stays the entry point for screen design: it already calls Lazyweb for
references and adds the two things the generic route can't — the codebase fit audit and the
Uzbek recommendation. Reach for the `lazyweb-*` skills directly for standalone research
(a growth score, an experiment lookup, a reference hunt with no build attached).

<!-- LAZYWEB:ROUTER:BEGIN v0.15.3 — managed by `lazyweb-router`; do not edit inside; run `~/.lazyweb/bin/lazyweb-router remove` to uninstall -->
## Lazyweb design-evidence routing

Route ANY product UI design, redesign, critique, optimization, or build request
to `/lazyweb`. Quietly gather only relevant evidence from screens, experiments,
flows, and growth mechanics while you work. Use only the research types the task
needs. Use that evidence in the product decision, then finalize useful selected
evidence into Agentic Search and return its stable link. Never start a Growth
Report unless the user explicitly asks for one.

To act on a row, invoke that skill by name if your client supports skills; otherwise read <skill>/SKILL.md under your client's installed Lazyweb skills directory (e.g. ~/.claude/skills, ~/.codex/skills, ~/.cursor/skills) and follow it.

| The user asks for… | Skill |
|---|---|
| List Backlog recommendations or add a growth spec | `lazyweb-growth-backlog` |
| Generate or iterate a Lazyweb Growth Report | `lazyweb-growth-report` |
| Get, generate, or compare a website Growth Score | `lazyweb-growth-score` |
| Research growth, pricing, trial, paywall, and monetization experiments | `lazyweb-search-experiments` |
| Research ordered multi-screen product flows | `lazyweb-search-flows` |
| Research product screens and visual UI patterns | `lazyweb-search-screens` |
| Anything else UI-related | `lazyweb` (picks the right mode) |

Do not route: backend/CLI/infra work, prose copyediting, non-product visuals.
If the request is ambiguous between two modes, ask the user one short
clarifying question before proceeding; if you cannot ask, choose the closer
mode, say so, and continue.
<!-- LAZYWEB:ROUTER:END -->

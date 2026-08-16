---
name: ui-designer
description: Designs or redesigns any screen of this StoreX Telegram Mini App storefront by pulling real shipped mobile-commerce references from Lazyweb, checking them against what this codebase and API can actually build, producing 3 structurally different concepts, re-verifying each against real data, and presenting the single best-fitting one. Use this whenever the user wants UI work on this project — "make it look like a modern online store", "redesign the home page", "this screen feels dated", "improve the cart/checkout/product page UX", "give me design options", "how should this new screen look" — even when they don't say the word "design". Also use before building any brand-new screen, so the layout is grounded in shipped e-commerce patterns instead of invented on the spot.
---

# UI Designer — StoreX Telegram Mini App

A design that looks great in a moodboard and cannot be built here is worth nothing.
This skill exists to close that gap: it grounds every proposal in (a) real shipped
mobile-commerce interfaces and (b) the concrete limits of this codebase — the
components that exist, the API fields that actually come back, and the Telegram
WebView the app lives inside.

The end product is **one recommended concept**, presented to the user in Uzbek,
with two rejected alternatives summarized so the choice is visible and reversible.

## Before you start — read the two ground-truth documents

Neither is optional, and neither should be summarized from memory:

1. `DESIGN_STANDARD.md` (repo root) — the binding visual contract: 4px spacing grid,
   fixed radius/typography scales, token-only colors, per-component measurements.
   A concept that violates it is rejected, not negotiated.
2. `.claude/skills/ui-designer/references/system-parameters.md` — the technical
   passport: stack, real component inventory, icon/animation situation, Telegram
   constraints, data reality.

If the user's request touches a specific screen, also read that page file itself.
You cannot redesign what you haven't looked at.

## Step 0 — Pin down the scope

Before spawning anything, be able to answer:

- **Which screen(s)?** One screen is the normal unit. "The whole app" is a series of
  screens — start with the highest-traffic one (Home → Catalog → Product detail →
  Cart → Checkout) and say you're doing that.
- **What is the user trying to accomplish on it?** "Find something to buy" and
  "confirm an order I already decided on" produce completely different layouts.
- **What is wrong with it today?** If the user just said "make it modern", open the
  current page and form your own diagnosis — density, hierarchy, dead space,
  trust signals, thumb reach. Name it. A redesign without a diagnosis is redecoration.

Only ask the user if a genuine fork exists (e.g. "should the catalog stay 2-column
or move to a single-column editorial list?" is a real product decision). Otherwise
decide and state your assumption.

## Step 1 — Research and audit, in parallel

Spawn both subagents **in a single message** so they run concurrently. They answer
different questions and neither should wait for the other.

**`ui-researcher`** — finds real shipped mobile storefronts solving the same
problem, looks at the screenshots, and reports a pattern inventory. Give it:
- the screen's purpose and the shopper's job on it
- `platform: mobile` (this app is mobile-only, inside Telegram)
- an absolute scratchpad path for downloads

**`system-fit-auditor`** — reports what this codebase can support today. Give it:
- the target page path (e.g. `src/pages/Home.tsx`) or the new screen's description
- the screen's purpose

The auditor's most valuable output is the **field list the API actually returns**.
Designs die on this: a concept built around review counts, delivery ETA or stock
urgency is fiction if `types.ts` and the backend don't carry those fields.

## Step 2 — Build three structurally different concepts

Three variations of the same layout are not three concepts. Force real divergence —
the point is to give the user a genuine choice, and to surface the tradeoff between
familiarity and distinctiveness.

A useful spread for mobile commerce:

- **Conversion-first** — dense, conventional, everything above the fold, minimal
  scroll to add-to-cart. Lowest risk, lowest personality.
- **Editorial / brand-forward** — bigger imagery, more breathing room, curated
  sections. Higher personality, costs vertical space.
- **Task-focused** — optimized for the returning shopper: reorder, favorites,
  search-first, fewer decorative blocks.

For each concept write:
- **Skeleton** — the vertical block order, top to bottom, with what is above the fold
  at a 360×640 viewport (the realistic Telegram floor, not an iPhone 15 Pro).
- **Reference** — which Lazyweb pattern it draws from, and the local image path.
- **Components** — which existing components it reuses, which need modification,
  which are new.
- **Data** — every field it renders, marked as existing / missing.
- **Cost** — rough size of the change: which files, and whether any backend work
  is implied.

Ground every structural claim in something the researcher actually saw. Inventing a
"typical pattern" defeats the purpose of the research step.

## Step 3 — Re-verify each concept against reality

Concepts drift optimistic while you're writing them. So hand each one back for a
second, adversarial pass: spawn **one `system-fit-auditor` per concept, in parallel**,
this time giving it the concept description plus the first audit report, and asking it
to verify specifically:

- every field the concept renders exists in the API response today
- every component it uses exists, or its cost is stated honestly
- it obeys `DESIGN_STANDARD.md` (spacing grid, radius/type scale, token-only colors)
- it survives the Telegram constraints: safe areas, tab bar clearance, the theme
  variables flipping to a dark palette, and Uzbek copy running ~30% longer than English

Then score each concept out of 5 on: **fit** (buildable today), **shopper value**
(does it help someone buy), **cost**, **distinctiveness**. Show the scores — the
user should be able to see why the winner won, not just be told.

If verification kills the concept you liked, say so plainly and pick the one that
survived. That is the system working, not a failure.

## Step 4 — Present the recommendation

Write this part **in Uzbek** — the user and every string in the app are Uzbek.
Keep it short enough to read on a phone. Use this shape:

```
## Tavsiya: <konsepsiya nomi>

<2-3 jumla: nima o'zgaradi va nega aynan shu>

**Ekran tuzilishi (yuqoridan pastga)**
1. ...
2. ...

**Nega shu variant**
- <dalil — qaysi real ilova naqshiga asoslangan>
- <fit: mavjud komponentlar/maydonlar bilan ishlaydi>

**Nima kerak bo'ladi**
- Yangi/o'zgaradigan komponentlar: ...
- Backend ishi: ... (yoki "yo'q")

**Rad etilgan variantlar**
- <B nomi> — <bir jumlada nega yo'q>
- <C nomi> — <bir jumlada nega yo'q>

**Ochiq savollar**
- <faqat haqiqiy qaror talab qiladiganlar; yo'q bo'lsa yozmang>
```

Attach the reference images you actually used (local paths), and where a Lazyweb
Agentic Search was finalized, the stable URL.

Then stop and let the user choose. Implementing an unapproved redesign wastes their
time and yours.

## Step 5 — Implement, only after approval

Hand the approved concept to the **`react-frontend-dev`** agent, or implement it
yourself following the same rules. Either way the handoff must carry: the block
skeleton, the component list, the exact fields with their types, and the relevant
`DESIGN_STANDARD.md` sections. A vague handoff produces a design that drifts from
what the user approved.

Ship it screen by screen and verify with `npm run build` and `npm run lint`.

## Where this goes wrong

- **Skipping the audit because the screen "looks simple."** Simple screens are
  exactly where invented fields slip through.
- **Describing images you never opened.** The researcher must `Read` every
  screenshot; metadata text is not seeing.
- **Three concepts that are one concept.** If the block order is the same in all
  three, you've given the user no choice.
- **Desktop references.** Search `platform: mobile`. A dashboard layout does not
  transfer to a 360px WebView.
- **Hardcoded hex.** The brand color arrives from Telegram's theme at runtime;
  a design pinned to specific colors breaks the moment the theme changes.
- **Forgetting the tab bar.** 56px plus safe-area is permanently occupied at the
  bottom of every tabbed screen, and Telegram's MainButton can occupy more.

## Deeper reference

- `references/system-parameters.md` — full technical passport (read every time)
- `DESIGN_STANDARD.md` — the visual contract
- `BACKEND_TASKS.md` — API changes already requested; check before declaring a
  field impossible, it may already be queued
- `E-Store_Telegram_MiniApp_TZ.md` — the original spec, including the full endpoint table

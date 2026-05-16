# StoreX Design Standard

Telegram Mini App e-commerce — bir xil, toza, professional UI uchun majburiy qoidalar.
Figma source: https://www.figma.com/design/IMgcNgod8znsom9PB23EIo/StoreX

## 1. Spacing scale (4px grid)

Faqat shu qiymatlarni ishlat. Aralash o'lcham yo'q.

| Token | Px  | Tailwind | Qachon                                  |
| ----- | --- | -------- | --------------------------------------- |
| 4     | 4   | 1        | Icon-text yonma-yon, kichik gap         |
| 8     | 8   | 2        | Chip ichidagi, badge ichidagi           |
| 12    | 12  | 3        | Card gap, grid gap, section header bot. |
| 16    | 16  | 4        | Page horizontal padding (MAJBURIY)      |
| 20    | 20  | 5        | Block ichidagi vertical                 |
| 24    | 24  | 6        | Sectionlar orasi (divider yo'q joyda)   |
| 32    | 32  | 8        | Katta hero spacing                      |

**Page horizontal padding: har doim 16px (`px-4`).** Hech qachon px-3, px-5 yo'q.

## 2. Section rhythm

```
[Header (h2 17px bold) + Link]   ← mb-3 (12px)
[Section content]
[24px breathing space yoki 8px divider strip]
[Next section header]
```

- Section vertical padding: `py-4` (16px), header bottom margin: `mb-3` (12px).
- Section-lar orasida: vizual ajratuv kerak bo'lsa `storex-divider` (8px gray), aks holda 24px breathing.
- Birinchi section'dan oldin hech qachon divider yo'q.

## 3. Radius scale

| Token              | Px  | Qachon                                  |
| ------------------ | --- | --------------------------------------- |
| --storex-radius-xs | 6   | Badge, small chip                       |
| --storex-radius-sm | 10  | Input, small button, secondary chip     |
| --storex-radius-md | 14  | Card, list-item, primary button         |
| --storex-radius-lg | 18  | Hero banner, large card, bottom sheet   |
| --storex-radius-xl | 24  | Decorative / featured                   |

## 4. Typography (system font, no custom fonts)

| Role             | Size | Weight | Line-height                  |
| ---------------- | ---- | ------ | ---------------------------- |
| Page title (h1)  | 22   | 700    | 1.2                          |
| Section title    | 17   | 700    | 1.25                         |
| Card title       | 14   | 500    | 1.35 (line-clamp-2)          |
| Body             | 14   | 400    | 1.5                          |
| Secondary / hint | 13   | 400    | 1.4                          |
| Price (card)     | 15   | 700    | 1.1                          |
| Price (PDP)      | 24   | 800    | 1                            |
| Caption          | 11   | 500    | 1.3                          |
| Badge            | 10   | 700    | 1, uppercase                 |

## 5. Color tokens — faqat var(...) orqali

- Brand: `var(--storex-primary)` — Telegram theme'dan keladi.
- Background: `var(--tg-theme-bg-color)` (page), `var(--tg-theme-secondary-bg-color)` (chip/divider/skeleton).
- Text: `var(--tg-theme-text-color)`, hint: `var(--tg-theme-hint-color)`.
- Sale red: `var(--storex-price-sale)` (#ef4444), success green: `var(--storex-success)` (#22c55e).

**Hard-coded hex MUMKIN EMAS** — faqat ikona `#fff` yoki shaffof rangda istisno.

## 6. Components — measurable rules

### SearchBar (sticky top)
- Background: `var(--storex-primary)`.
- Padding: `px-4 pt-3 pb-3` (12px vertical), brand+bell row va search input orasida `mb-3` (12px).
- Brand: 17px / 700 / white. Bell: 36×36 round, white 18% alpha bg.
- Search input: 40px height, radius `--storex-radius-md` (14px), white 95% bg, icon 18px hint-colored.

### CategoryChips
- 4-column grid har doim. Agar > 8 → birinchi 7 ta + "Yana" tugmasi.
- Icon: 56×56 circle (avval 48 edi — kichik). Background: pastel rang yoki primary-light.
- Label: 12px / 500, max 1 line, ellipsis.
- Grid gap: `gap-x-3 gap-y-4` (12px / 16px).
- Container padding: `px-4 py-4`.

### ProductCard
- White bg, `--storex-radius-md` (14px), `--storex-shadow-card`.
- Image: aspect-square, secondary-bg fallback, radius top corners only.
- Info padding: `p-3` (12px), gap: 6px between title/price.
- Title: 14px / 500 / 2-line clamp, text-color.
- Price: 15px / 700, sale red if `old_price`. Old price: 12px / line-through / hint color.
- Discount badge: top-left, 10px / 700, sale red bg, white text, 6px radius, `px-1.5 py-0.5`.
- Heart: top-right, 28×28 circle, white 90% bg.
- "+" button: 32×32 circle, primary bg, white "+", shadow-sm.

### ProductGrid
- `grid-cols-2`, `gap-3` (12px), `px-4`, `items-stretch`.

### Hero banner
- Height: 160px (avval 180 — pastroq), `mx-4 mt-3`, radius lg (18px).
- Title overlay: 18px / 700 / white, drop-shadow.

### Tab bar
- 4 ta tab, height 56px (avval 52 — biroz kattaroq tap-target).
- Icon 24×24, label 11px / 500. Active = primary color, inactive = hint.

### PageLayout main padding
- `pb-[calc(56px+env(safe-area-inset-bottom))]` (tab bar height yangi).

## 7. Shadows

- `--storex-shadow-card`: subtle inset card shadow (existing).
- Floating elements (toast, sheet): `--storex-shadow-lg`.
- Sticky search/header: NO shadow (faqat solid color).

## 8. Tap-target minimum

48×48 px (Apple HIG). Kichik icon button → padding bilan bo'sh joy ortir.

## 9. Animation

- Press: `scale(0.97)`, 150ms ease. `press-effect` class.
- Page enter: 200ms slide-up + fade. `page-enter` class.
- Hech qaysi animatsiya 300ms dan oshmaydi.

## 10. Ko'p ishlatiladigan anti-pattern'lar (TAQIQ)

1. Inline `style={{ padding: '...' }}` agar Tailwind class bilan ifoda qilish mumkin bo'lsa.
2. `gap-1.5`, `py-2.5`, `mt-3.5` kabi 0.5 ulush — 4px grid'ni buzadi.
3. Yangi rang hex — token qo'sh, inline berma.
4. Section ichida border + shadow + gradient bir vaqtda — bittasini tanla.
5. `text-[10px]`, `text-[13px]` jonli sons — faqat typography table'dagi qiymatlar.

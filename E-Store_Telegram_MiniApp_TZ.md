# Telegram Mini App — Texnik Topshiriq

## E-Store Multi-Company Platform — Telegram Bot & Mini App

**Versiya:** 1.0  
**Sana:** 2026-02-15  
**Platforma:** Telegram Web Apps SDK + React  
**Dizayn uslubi:** Telegram Native UI  
**Maqsad:** Har bir kompaniya uchun alohida Telegram bot va Mini App do'kon

---

## Mundarija

1. [Umumiy arxitektura](#1-umumiy-arxitektura)
2. [UI/UX falsafasi va dizayn tamoyillari](#2-uiux-falsafasi-va-dizayn-tamoyillari)
3. [Rang palitra va tipografiya](#3-rang-palitra-va-tipografiya)
4. [Sahifalar tuzilmasi (Screen Map)](#4-sahifalar-tuzilmasi-screen-map)
5. [Bosh sahifa (Home)](#5-bosh-sahifa-home)
6. [Katalog va kategoriyalar](#6-katalog-va-kategoriyalar)
7. [Mahsulot sahifasi](#7-mahsulot-sahifasi)
8. [Qidirish](#8-qidirish)
9. [Savat (Cart)](#9-savat-cart)
10. [Checkout](#10-checkout)
11. [Buyurtmalar tarixi va tracking](#11-buyurtmalar-tarixi-va-tracking)
12. [Profil va manzillar](#12-profil-va-manzillar)
13. [Telegram Bot komandalar](#13-telegram-bot-komandalar)
14. [Telegram Web Apps SDK integratsiya](#14-telegram-web-apps-sdk-integratsiya)
15. [Navigatsiya tizimi](#15-navigatsiya-tizimi)
16. [Animatsiya va mikro-interaksiyalar](#16-animatsiya-va-mikro-interaksiyalar)
17. [Performance va optimallashtirish](#17-performance-va-optimallashtirish)
18. [Offline va xato holatlar](#18-offline-va-xato-holatlar)
19. [Notification tizimi](#19-notification-tizimi)
20. [API Endpoints (Mini App uchun)](#20-api-endpoints-mini-app-uchun)
21. [Texnik implementatsiya](#21-texnik-implementatsiya)

---

## 1. Umumiy arxitektura

### 1.1. Qanday ishlaydi

```
Foydalanuvchi
    │
    ▼
Telegram App (iOS/Android/Desktop)
    │
    ├── Bot Chat ──────────── Bot Commands (/start, /orders, /help)
    │                              │
    │                              ▼
    │                        Laravel Webhook Handler
    │                              │
    │                              ▼
    │                        Bot javoblari + inline keyboard
    │
    └── Mini App ──────────── React SPA (Telegram Web Apps SDK)
                                   │
                                   ▼
                             Laravel REST API
                                   │
                          ┌────────┼────────┐
                          ▼        ▼        ▼
                    PostgreSQL  MongoDB   Redis
```

### 1.2. Asosiy prinsiplar

- **Bitta kod bazasi, ko'p bot:** Har bir kompaniya alohida bot tokenga ega, lekin barcha botlar bitta Laravel webhook handler'ga keladi. `company_id` bot token orqali aniqlanadi.
- **Mini App = React SPA:** Telegram WebView ichida yuklangan React ilova. Telegram Web Apps SDK orqali native interaksiya.
- **Autentifikatsiya:** Telegram `initData` orqali — parol yoki OTP kerak emas. Foydalanuvchi bot'ni ochishi = avtomatik login.
- **Har bir kompaniya = alohida do'kon:** Mini App ochilganda bot token orqali kompaniya aniqlanadi, branding (logo, rang, kategoriyalar) shunga qarab yuklanadi.

### 1.3. Texnologik stek

| Komponent | Texnologiya |
|-----------|-------------|
| Mini App Frontend | React 18 + TypeScript |
| Routing | React Router v6 |
| State Management | Zustand (yengil, tez) |
| Styling | Tailwind CSS + Telegram CSS variables |
| API Client | Axios / TanStack Query (React Query) |
| Telegram SDK | @twa-dev/sdk |
| Build Tool | Vite |
| Backend | Laravel (mavjud API) |
| Media | Lazy loading + WebP + blurhash placeholder |

---

## 2. UI/UX falsafasi va dizayn tamoyillari

### 2.1. Telegram Native dizayn falsafasi

Mini App Telegram'ning ichki qismi kabi ko'rinishi kerak — foydalanuvchi alohida ilova ochganini his qilmasligi kerak. Bu quyidagi tamoyillar orqali erishiladi:

**"Telegram ichida" qoidalari:**

| Qoida | Tavsif | Misol |
|-------|--------|-------|
| Telegram ranglarini ishlatish | `var(--tg-theme-*)` CSS variables orqali Telegram mavzusiga moslashish | Dark mode yoqilsa — Mini App ham avtomatik qorong'u bo'ladi |
| Telegram shriftini ishlatish | System font stack — `-apple-system, 'SF Pro', 'Helvetica Neue', sans-serif` | iOS'da SF Pro, Android'da Roboto |
| Telegram bo'shliq tizimi | 16px gorizontal padding, 8px vertikal rhythm | Telegram chat'dagi bo'shliqlar bilan bir xil |
| Telegram komponentlar | Section card'lar, inline button'lar, separator'lar Telegram stilida | Settings sahifasi = Telegram Settings ko'rinishida |
| Native feedback | `HapticFeedback` har bir muhim interaksiyada | Savatga qo'shish = light impact, to'lov = heavy impact |
| Minimal dekoratsiya | Shadow'lar, gradient'lar, border-radius minimal | Flat dizayn, Telegram card stilidagi border-radius: 12px |

### 2.2. Mobile-first UX tamoyillari

- **Bir qo'l ishlatish:** Barcha muhim tugmalar ekranning pastki 1/3 qismida
- **Maksimal 3 ta tap:** Istalgan mahsulotga bosh sahifadan 3 ta bosish ichida yetish mumkin
- **Tezlik > go'zallik:** Animatsiyalar qisqa (150-200ms), rasmlar lazy-load, skeleton screen
- **Kontekst saqlash:** Orqaga qaytganda scroll pozitsiya va filter'lar saqlanadi
- **Katta touch target:** Barcha bosiladigan elementlar kamida 44×44px

### 2.3. Telegram vs oddiy web app farqlari

| Element | Oddiy Web App | Telegram Mini App |
|---------|--------------|-------------------|
| Header | Custom navbar | Telegram native header (BackButton) |
| Bottom nav | Tab bar | Mini Tab bar (kompakt) yoki Telegram MainButton |
| Pull to refresh | Custom | Telegram native `enableClosingConfirmation` |
| Payment | Redirect to gateway | Telegram Payment API yoki redirect |
| Auth | Login form | Avtomatik (initData) |
| Dark mode | Manual toggle | Telegram mavzusiga avtomatik moslashish |
| Scroll behavior | Custom | Telegram expansion behavior (`isExpanded`) |
| Haptic | Yo'q | `HapticFeedback.impactOccurred()` |

---

## 3. Rang palitra va tipografiya

### 3.1. Telegram CSS Variables (asosiy)

Mini App **hech qachon** qattiq rang kodlamasligi kerak. Faqat Telegram CSS variables ishlatiladi:

```css
/* Asosiy ranglar — Telegram tomonidan boshqariladi */
--tg-theme-bg-color            /* Sahifa fon rangi */
--tg-theme-text-color          /* Asosiy matn rangi */
--tg-theme-hint-color          /* Ikkilamchi matn (subtitle, placeholder) */
--tg-theme-link-color          /* Havolalar rangi */
--tg-theme-button-color        /* Asosiy tugma fon rangi */
--tg-theme-button-text-color   /* Asosiy tugma matn rangi */
--tg-theme-secondary-bg-color  /* Ikkilamchi fon (card, section) */
--tg-theme-header-bg-color     /* Header fon rangi */
--tg-theme-accent-text-color   /* Accent matn rangi */
--tg-theme-section-bg-color    /* Section fon rangi */
--tg-theme-section-header-text-color  /* Section sarlavha rangi */
--tg-theme-subtitle-text-color /* Subtitle matn rangi */
--tg-theme-destructive-text-color /* Xato / o'chirish rangi (qizil) */
```

### 3.2. Qo'shimcha rang definitsiyalar

Telegram variables'da yo'q bo'lgan ranglar uchun kompaniya branding'idan olinadi:

```css
/* Kompaniya branding — /storefront/init dan olinadi */
--store-accent: #2481cc;        /* Default: Telegram link color */
--store-success: #31b545;       /* Muvaffaqiyat (yashil) */
--store-warning: #e8a427;       /* Ogohlantirish (sariq) */
--store-badge-bg: #e53e3e;      /* Badge fon (qizil) — savat counter */
--store-badge-text: #ffffff;    /* Badge matn */
--store-price-old: var(--tg-theme-hint-color);  /* Eski narx — chizilgan */
--store-price-sale: #e53e3e;    /* Chegirmali narx — qizil */
--store-skeleton: var(--tg-theme-secondary-bg-color);  /* Skeleton loading fon */
```

### 3.3. Tipografiya

```css
/* Telegram native shrift stack */
font-family: -apple-system, 'SF Pro Text', 'SF Pro', system-ui, 
             'Helvetica Neue', Helvetica, 'Segoe UI', Roboto, sans-serif;

/* O'lchamlar — Telegram iOS stiliga yaqin */
--font-caption:  12px / 16px;   /* Meta, badge, timestamp */
--font-body:     14px / 20px;   /* Asosiy matn */
--font-callout:  15px / 20px;   /* Card title, list item */
--font-headline: 16px / 22px;   /* Section header */
--font-title:    20px / 24px;   /* Sahifa sarlavhasi */
--font-large:    28px / 34px;   /* Jami narx, katta raqamlar */

/* Font weight */
--weight-regular: 400;
--weight-medium: 500;     /* Telegram oddiy matn */
--weight-semibold: 600;   /* Telegram sarlavhalar */
```

### 3.4. Bo'shliq tizimi (Spacing)

```css
/* 4px asosida spacing tizimi */
--spacing-xs:  4px;    /* Eng kichik (icon va matn orasida) */
--spacing-sm:  8px;    /* Kichik (element ichki padding) */
--spacing-md:  12px;   /* O'rta (card ichki padding) */
--spacing-base: 16px;  /* Asosiy (horizontal padding, section gap) */
--spacing-lg:  20px;   /* Katta (section orasida) */
--spacing-xl:  32px;   /* Eng katta (sahifa yuqori/pastki) */

/* Telegram standart o'lchamlar */
--radius-sm: 8px;      /* Kichik elementlar (badge, chip) */
--radius-md: 12px;     /* Card, button */
--radius-lg: 16px;     /* Section card, modal */
--radius-full: 9999px; /* Circle (avatar, icon button) */
```

---

## 4. Sahifalar tuzilmasi (Screen Map)

### 4.1. Navigatsiya diagrammasi

```
Bot /start
    │
    ▼
┌─────────────────────────────────────────────────┐
│                  MINI APP                        │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │          Bottom Tab Navigation            │   │
│  │                                           │   │
│  │  🏠 Bosh    📦 Katalog   🛒 Savat   👤 Profil│   │
│  └──────┬────────┬──────────┬─────────┬─────┘   │
│         │        │          │         │          │
│         ▼        ▼          ▼         ▼          │
│     Home      Katalog     Savat     Profil       │
│      │          │          │         │           │
│      ├─ Banner  ├─ Kateg.  ├─ Items  ├─ Orders   │
│      │  slider  │  tree    │  list   │  list     │
│      │          │          │         │           │
│      ├─ Kateg.  ├─ Filter  ├─ Promo  ├─ Addresses│
│      │  chips   │  modal   │  code   │  list     │
│      │          │          │         │           │
│      ├─ Aksiya  ├─ Product ├─ Summa  ├─ Settings │
│      │  section │  grid    │  block  │           │
│      │          │          │         │           │
│      ├─ Yangi   └─ Product └─► Checkout           │
│      │  section    detail      │                  │
│      │                         ├─ Manzil tanlash  │
│      └─ Tavsiya                ├─ Yetkazish usuli │
│         section                ├─ To'lov usuli    │
│                                └─ Tasdiqlash      │
│                                     │             │
│                                     ▼             │
│                               Order Success       │
│                                     │             │
│                                     ▼             │
│                               Order Tracking      │
└─────────────────────────────────────────────────┘
```

### 4.2. Sahifalar ro'yxati

| # | Sahifa | Route | Tavsif |
|---|--------|-------|--------|
| 1 | Bosh sahifa | `/` | Hero banner, kategoriyalar, aksiya, yangi, tavsiya |
| 2 | Katalog | `/catalog` | Barcha mahsulotlar grid, filter, sort |
| 3 | Kategoriya | `/catalog/:categorySlug` | Bitta kategoriya mahsulotlari |
| 4 | Mahsulot | `/product/:productSlug` | Tafsilot, galereya, variant tanlash |
| 5 | Qidirish | `/search` | Qidirish natijalari, tavsiyalar |
| 6 | Savat | `/cart` | Savat ro'yxati, promo-kod, jami |
| 7 | Checkout | `/checkout` | Manzil, yetkazish, to'lov, tasdiqlash |
| 8 | To'lov | `/payment/:orderId` | Click/Payme redirect sahifasi |
| 9 | Buyurtma muvaffaqiyat | `/order-success/:orderId` | Tasdiqlash va tracking link |
| 10 | Buyurtmalar | `/orders` | Buyurtmalar ro'yxati |
| 11 | Buyurtma tafsiloti | `/orders/:orderId` | Status timeline, tarkib, tracking |
| 12 | Profil | `/profile` | Telegram ma'lumotlari, sozlamalar |
| 13 | Manzillar | `/profile/addresses` | Saqlangan manzillar ro'yxati |
| 14 | Manzil qo'shish/tahrirlash | `/profile/addresses/new` | Manzil formasi |

---

## 5. Bosh sahifa (Home)

Bosh sahifa foydalanuvchi Mini App'ni ochganda birinchi ko'radigan sahifa. Maqsad: tezda kerakli mahsulotni topish yoki yangi narsalarni kashf qilish.

### 5.1. Sahifa tuzilmasi (yuqoridan pastga)

```
┌─────────────────────────────────┐
│  🔍 Qidirish inputi (bosilsa   │  ← Sticky, scroll'da ko'rinadi
│     /search ga o'tadi)          │
├─────────────────────────────────┤
│                                 │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │    🖼 Hero Banner Slider   │  │  ← Marketing bannerlar
│  │    (auto-swipe, 4 soniya)  │  │     placement: home_hero
│  │    ● ○ ○                   │  │     Balandlik: 160px
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                 │
│  Kategoriyalar                  │  ← Horizontal scroll chips
│  [🍎 Meva] [🥩 Go'sht] [🧴 Gig] │     Bosilsa /catalog/:slug ga
│                                 │
│  🔥 Aksiya mahsulotlar          │  ← Section header + "Barchasi →"
│  ┌──────┐  ┌──────┐            │     2 ustunli grid
│  │ 📷   │  │ 📷   │            │     Faqat chegirmali mahsulotlar
│  │ Nom  │  │ Nom  │            │     Max 6 ta ko'rsatiladi
│  │💰 narx│  │💰 narx│            │
│  └──────┘  └──────┘            │
│                                 │
│  ⭐ Yangi mahsulotlar            │  ← Section header + "Barchasi →"
│  ┌──────┐  ┌──────┐            │     Oxirgi 2 haftada qo'shilgan
│  │ 📷   │  │ 📷   │            │
│  │ Nom  │  │ Nom  │            │
│  │💰 narx│  │💰 narx│            │
│  └──────┘  └──────┘            │
│                                 │
│  👍 Tavsiya etilgan              │  ← Section header
│  ┌──────┐  ┌──────┐            │     Eng ko'p sotilganlar
│  │ 📷   │  │ 📷   │            │     yoki rating bo'yicha top
│  │ Nom  │  │ Nom  │            │
│  │💰 narx│  │💰 narx│            │
│  └──────┘  └──────┘            │
│                                 │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │  ← Mid-page banner
│  │  🖼 Reklama Banner         │  │     placement: home_mid
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │     (ixtiyoriy, bo'sh bo'lsa skip)
│                                 │
│  📂 Har bir kategoriyadan       │  ← Har bir kategoriya uchun
│     4 ta mahsulot               │     2×2 grid + "Barchasi →"
│  ┌──────┐  ┌──────┐            │
│  │ 📷   │  │ 📷   │            │
│  └──────┘  └──────┘            │
│  ┌──────┐  ┌──────┐            │
│  │ 📷   │  │ 📷   │            │
│  └──────┘  └──────┘            │
│                                 │
├─────────────────────────────────┤
│ 🏠 Bosh  📦 Katalog 🛒 Savat 👤 │  ← Bottom Tab Bar
└─────────────────────────────────┘
```

### 5.2. Bosh sahifa komponentlari batafsil

#### Qidirish inputi (Search Bar)

- **Joylashuv:** Sahifa yuqorisida, scroll qilganda sticky qoladi
- **Ko'rinish:** Rounded input, ichida 🔍 icon va placeholder: "Mahsulot qidirish..."
- **Xatti-harakat:** Bosilganda `/search` sahifasiga o'tadi (input o'zi emas, navigation trigger)
- **Balandlik:** 36px, background: `var(--tg-theme-secondary-bg-color)`

#### Hero Banner Slider

- **Placement:** `home_hero` — marketing modulidan bannerlar olinadi
- **O'lcham:** To'liq kenglik, balandlik 160px (rasm: 768×400 mobile variant)
- **Xatti-harakat:** Auto-swipe har 4 soniyada, qo'lda swipe ham mumkin
- **Indicator:** Pastki markazda dot'lar (active dot kattaroq)
- **Bosilganda:** Banner `link_value` ga navigate (mahsulot, kategoriya, URL)
- **Agar banner yo'q bo'lsa:** Bu section to'liq yashiriladi
- **Animatsiya:** `ease-in-out` swipe, 300ms transition

#### Kategoriyalar chips

- **Ko'rinish:** Horizontal scroll, har bir chip: icon/emoji + nom
- **Chip dizayn:** `var(--tg-theme-secondary-bg-color)` fon, border-radius: 20px, padding: 6px 14px
- **Icon:** Kategoriya rasmi (24×24) yoki emoji
- **Bosilganda:** `/catalog/:categorySlug` ga navigate
- **Max ko'rsatish:** Barcha kategoriyalar (scroll qilinadi)

#### Mahsulot Section'lari (Aksiya / Yangi / Tavsiya / Kategoriya)

Har bir section bir xil tuzilmaga ega:

- **Section header:** Chapda sarlavha (semibold, 16px), o'ngda "Barchasi →" link
- **Grid:** 2 ustunli, gap: 8px
- **Max items:** 4-6 ta (2-3 qator), "Barchasi" bosilsa to'liq ro'yxat ochiladi

#### Mahsulot Card (Grid item)

```
┌─────────────────┐
│                  │
│    📷 Rasm       │  ← 1:1 aspect ratio, border-radius: 12px
│    (WebP)        │     Lazy load + blurhash placeholder
│                  │
│  ❤️              │  ← Rasm ustida: sevimli tugma (yuqori o'ng)
│  -20%            │  ← Rasm ustida: chegirma badge (yuqori chap)
│                  │     Qizil fon, oq matn, border-radius: 8px
├─────────────────┤
│ Mahsulot nomi    │  ← Max 2 qator, ellipsis, 14px regular
│ ikilanchi qator  │
│                  │
│ 80,000 so'm      │  ← Asosiy narx: 15px semibold
│ ~~100,000~~      │  ← Eski narx (agar chegirma): 12px, chizilgan, hint color
│                  │
│ [🛒 Savatga]     │  ← Kichik tugma, yoki "+" icon button
└─────────────────┘
```

**Card o'lchamlari:**
- Kenglik: `(screen_width - 16*2 - 8) / 2` — 2 ta card, 16px yon padding, 8px gap
- Rasm balandligi: kenglikka teng (1:1)
- Matn qism: ~80px
- Jami card balandligi: ~250px

**Card interaksiya:**
- Bosilganda: `/product/:slug` ga navigate (HapticFeedback.selectionChanged)
- "Savatga" tugmasi bosilganda: savatga qo'shiladi (HapticFeedback.impactOccurred('light')), tugma "✓" ga aylanadi 1 soniya, keyin qaytadi
- Agar mahsulotda variantlar bo'lsa: "Savatga" bosilganda product detail'ga o'tadi (variant tanlash kerak)

### 5.3. Bosh sahifa API so'rovi

Bitta API so'rov bilan barcha ma'lumotlar olinadi (network so'rovlarni kamaytirish):

```
GET /api/v1/storefront/home
```

Response:
```json
{
  "banners": [...],           // home_hero placement bannerlari
  "banners_mid": [...],       // home_mid placement (ixtiyoriy)
  "categories": [...],        // Barcha kategoriyalar (icon, nom, slug)
  "sections": [
    {
      "type": "sale",
      "title": "Aksiya mahsulotlar",
      "products": [...]       // Max 6
    },
    {
      "type": "new",
      "title": "Yangi mahsulotlar",
      "products": [...]       // Max 6
    },
    {
      "type": "popular",
      "title": "Tavsiya etilgan",
      "products": [...]       // Max 6
    },
    {
      "type": "category",
      "title": "Meva va sabzavotlar",
      "category_slug": "meva",
      "products": [...]       // Max 4
    }
    // ... har bir kategoriya uchun
  ]
}
```

---

## 6. Katalog va kategoriyalar

### 6.1. Katalog sahifasi

```
┌─────────────────────────────────┐
│ ← Katalog                      │  ← Telegram BackButton
├─────────────────────────────────┤
│ 🔍 Qidirish...                  │
├─────────────────────────────────┤
│ Kategoriyalar                   │
│ [Barchasi] [🍎 Meva] [🥩 Go'sht]│  ← Horizontal chips, "Barchasi" active
├─────────────────────────────────┤
│ ⬇️ Saralash   🔽 Filter          │  ← Sort + Filter tugmalari
├─────────────────────────────────┤
│                                 │
│  ┌──────┐  ┌──────┐            │  ← 2 ustunli grid
│  │ 📷   │  │ 📷   │            │     Infinite scroll
│  │ Nom  │  │ Nom  │            │
│  │💰narx │  │💰narx │            │
│  └──────┘  └──────┘            │
│  ┌──────┐  ┌──────┐            │
│  │ 📷   │  │ 📷   │            │
│  │ Nom  │  │ Nom  │            │
│  │💰narx │  │💰narx │            │
│  └──────┘  └──────┘            │
│         ...                     │
│  ┌────────────────┐            │
│  │ ⏳ Yuklanmoqda  │            │  ← Infinite scroll loader
│  └────────────────┘            │
│                                 │
├─────────────────────────────────┤
│ 🏠 Bosh  📦 Katalog 🛒 Savat 👤 │
└─────────────────────────────────┘
```

### 6.2. Saralash (Sort)

Bosilganda Telegram stilidagi bottom sheet ochiladi:

| Variant | API param |
|---------|-----------|
| Mashxur (default) | `sort=popular` |
| Narx: arzon → qimmat | `sort=price_asc` |
| Narx: qimmat → arzon | `sort=price_desc` |
| Yangi → eski | `sort=newest` |
| Reyting bo'yicha | `sort=rating` |

Tanlangan variant chip ko'rinishida aktiv bo'ladi.

### 6.3. Filter (Bottom Sheet)

```
┌─────────────────────────────────┐
│ Filterlash                  ✕   │
├─────────────────────────────────┤
│                                 │
│ Narx oralig'i                   │
│ [10,000] ──●────●── [500,000]   │  ← Range slider
│                                 │
│ ─────────────────────────────── │
│                                 │
│ Brend                           │
│ ☑ Samsung   ☑ Apple             │  ← Checkbox ro'yxat
│ ☐ Xiaomi    ☐ Huawei            │     Har biri product count bilan
│                                 │
│ ─────────────────────────────── │
│                                 │
│ Reyting                         │
│ ☐ ⭐⭐⭐⭐⭐ (5)                    │
│ ☐ ⭐⭐⭐⭐ va yuqori (4+)          │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ Faqat chegirmali                │
│ [  ●━━━━━] Toggle               │  ← Toggle switch
│                                 │
├─────────────────────────────────┤
│ [  Tozalash  ] [ ✓ Qo'llash  ] │  ← 2 ta tugma
└─────────────────────────────────┘
```

Filter qo'llanganda katalog grid filterlangan mahsulotlarni ko'rsatadi. Aktiv filter'lar chips ko'rinishida grid yuqorisida ko'rinadi (× bilan o'chirish mumkin).

### 6.4. Infinite Scroll

- Sahifalar bo'yicha yuklash: `per_page=20`
- Scroll pastga yetganda keyingi sahifa avtomatik yuklanadi
- Yuklash paytida pastda skeleton loader (2 ta skeleton card)
- Barcha mahsulotlar tugaganda: "Boshqa mahsulot yo'q" xabari

---

## 7. Mahsulot sahifasi

### 7.1. Sahifa tuzilmasi

```
┌─────────────────────────────────┐
│ ←                        🔗 📤  │  ← BackButton + Share tugma
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      📷 Rasm Galereya    │   │  ← Swipeable, 1:1, dots indicator
│  │      (WebP, lazy load)  │   │     Pinch-to-zoom
│  │                         │   │
│  │    ● ○ ○ ○              │   │
│  └─────────────────────────┘   │
│                                 │
│  ❤️ Sevimlilarga qo'shish       │  ← Heart icon + matn
│                                 │
│  Mahsulot to'liq nomi bu yerda  │  ← 20px semibold, max 3 qator
│  ikkinchi qator                 │
│                                 │
│  ⭐ 4.5 (128 sharh)             │  ← Rating + sharhlar soni
│                                 │
│  ┌─────────────────────────┐   │
│  │ 80,000 so'm              │   │  ← Narx: 24px semibold
│  │ ~~100,000 so'm~~  -20%  │   │     Eski narx + chegirma badge
│  └─────────────────────────┘   │
│                                 │
│  Rangni tanlang                 │  ← Variant selector (agar bor)
│  (●)(●)(●)(○)                  │     Color circles yoki chip'lar
│                                 │
│  O'lchamni tanlang              │
│  [S] [M] [L] [XL]              │     Size chip'lar
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Tavsif                         │  ← Section header
│  Lorem ipsum dolor sit amet,    │     Expandable: default 3 qator
│  consectetur adipi...           │     "Ko'proq ko'rsatish ▼"
│  [Ko'proq ko'rsatish ▼]        │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Xususiyatlar                   │  ← Key-value ro'yxat
│  Brend         Samsung          │
│  Material      Plastik          │
│  Og'irlik      250g             │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Sharhlar (128)          Barchasi→│
│  ┌─────────────────────────┐   │
│  │ 👤 Aziz   ⭐⭐⭐⭐⭐         │   │  ← Oxirgi 3 ta sharh
│  │ Juda yaxshi mahsulot!   │   │
│  │ 2 kun oldin              │   │
│  └─────────────────────────┘   │
│                                 │
│  O'xshash mahsulotlar           │  ← Horizontal scroll, product cards
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │  │
│  │nom │ │nom │ │nom │ │nom │  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                 │
│  (pastda 80px bo'sh joy —       │
│   MainButton ustidan ko'rinish) │
│                                 │
├─────────────────────────────────┤
│                                 │
│  ████ Savatga qo'shish ████    │  ← Telegram MainButton
│  ████   80,000 so'm     ████    │     button_color + narx
│                                 │
└─────────────────────────────────┘
```

### 7.2. Interaksiyalar

| Element | Harakat | Natija |
|---------|---------|--------|
| Rasm galereya | Chapga/o'ngga swipe | Keyingi/oldingi rasm |
| Rasm | Ikki marta tap | Zoom in/out |
| ❤️ Sevimli | Tap | Toggle sevimli + HapticFeedback.impactOccurred('light') |
| Variant (rang/size) | Tap | Tanlangan variant belgilanadi, narx yangilanadi |
| "Ko'proq ko'rsatish" | Tap | Tavsif to'liq ochiladi (animated expand) |
| "Barchasi →" (sharhlar) | Tap | Sharhlar bottom sheet yoki alohida sahifa |
| O'xshash mahsulot card | Tap | Shu mahsulot sahifasiga navigate |
| MainButton "Savatga" | Tap | Savatga qo'shish + HapticFeedback.impactOccurred('medium') |

### 7.3. MainButton holatlari

| Holat | Matn | Rang |
|-------|------|------|
| Oddiy | "Savatga qo'shish — 80,000 so'm" | `button_color` |
| Variant tanlanmagan | "Variantni tanlang" | Disabled (kulrang) |
| Savatga qo'shildi | "✓ Qo'shildi" (1.5 sek) → "Savatga o'tish" | Yashil → button_color |
| Mavjud emas (stock=0) | "Hozirda mavjud emas" | Disabled |
| Allaqachon savatda | "Savatda (2 dona) — Savatga o'tish" | button_color |

---

## 8. Qidirish

### 8.1. Qidirish sahifasi

```
┌─────────────────────────────────┐
│ ← 🔍 [Qidirish inputi____] ✕   │  ← Avtofocus, clear button
├─────────────────────────────────┤
│                                 │
│  === Bo'sh holat (input bo'sh) === │
│                                 │
│  So'nggi qidiruvlar             │  ← Tarix (localStorage)
│  📎 telefon                  ✕  │
│  📎 kurtka                  ✕  │
│  📎 samsung galaxy          ✕  │
│                                 │
│  Mashxur qidiruvlar             │  ← API: /storefront/search/popular
│  🔥 iPhone  🔥 Poyabzal         │     Chip'lar
│  🔥 Soat    🔥 Sumka            │
│                                 │
│  === Yozish paytida (≥2 harf) === │
│                                 │
│  Natijalar (12)                 │
│  ┌──────┐  ┌──────┐            │
│  │ 📷   │  │ 📷   │            │     2 ustunli grid
│  │ Nom  │  │ Nom  │            │     Real-time, 300ms debounce
│  │💰narx │  │💰narx │            │
│  └──────┘  └──────┘            │
│                                 │
│  === Natija topilmasa =========== │
│                                 │
│  😔 "telefon123" bo'yicha       │
│  hech narsa topilmadi           │
│                                 │
│  Tavsiya:                       │
│  • Yozuvni tekshiring           │
│  • Boshqa kalit so'z ishlating  │
│                                 │
└─────────────────────────────────┘
```

### 8.2. Qidirish logikasi

- **Debounce:** 300ms — har bir tugma bosilishida emas, yozishni to'xtatgandan keyin
- **Minimal uzunlik:** 2 ta belgi kiritilgandan keyin qidirish boshlanadi
- **Backend:** Meilisearch (agar mavjud) yoki MongoDB text index
- **Natijalar:** Mahsulot nomi, kategoriya nomi, brend nomi bo'yicha qidirish
- **Tarix:** Oxirgi 10 ta qidirish — React state'da (Zustand persist)

---

## 9. Savat (Cart)

### 9.1. Savat sahifasi

```
┌─────────────────────────────────┐
│ ← Savat (3)                     │  ← BackButton + item count
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📷   Mahsulot nomi #1    │   │  ← Rasm (64×64) + nom + variant
│  │ 64px  Rangi: Qora         │   │
│  │       80,000 so'm         │   │     Narx
│  │       [-] 2 [+]       🗑 │   │     Miqdor counter + o'chirish
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📷   Mahsulot nomi #2    │   │
│  │ 64px  O'lchami: L         │   │
│  │       45,000 so'm         │   │
│  │       [-] 1 [+]       🗑 │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  🎟 Promo-kod                   │
│  ┌─────────────────────┐ [OK]  │  ← Input + qo'llash tugma
│  │ SALE20              │       │
│  └─────────────────────┘       │
│  ✅ Chegirma qo'llandi: -20%   │  ← Success xabar (yashil)
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Mahsulotlar (3)    205,000     │
│  Chegirma           -41,000     │  ← Qizil rang
│  Yetkazib berish     15,000     │
│  ─────────────────────────────  │
│  Jami               179,000 so'm│  ← 20px semibold
│                                 │
│  (pastda 80px bo'sh joy)        │
│                                 │
├─────────────────────────────────┤
│                                 │
│  ████ Buyurtma berish ██████   │  ← Telegram MainButton
│  ████  179,000 so'm   ██████   │
│                                 │
└─────────────────────────────────┘
```

### 9.2. Savat interaksiyalari

| Harakat | Natija | Feedback |
|---------|--------|----------|
| [-] tugmasi | Miqdor 1 ga kamayadi (min: 1) | Haptic: light |
| [+] tugmasi | Miqdor 1 ga oshadi (max: stock) | Haptic: light |
| 🗑 O'chirish | Swipe-to-delete yoki 🗑 tap → confirm dialog | Haptic: warning |
| Promo-kod "OK" | API tekshirish, muvaffaqiyatli → narx yangilanadi | Haptic: success yoki error |
| MainButton | `/checkout` ga navigate | Haptic: medium |

### 9.3. Bo'sh savat holati

```
┌─────────────────────────────────┐
│                                 │
│           🛒                    │
│                                 │
│    Savat bo'sh                  │  ← 20px semibold, markazda
│    Mahsulotlarni ko'rib         │     14px hint color
│    chiqing                      │
│                                 │
│    [ Katalogga o'tish ]         │  ← Tugma → /catalog
│                                 │
└─────────────────────────────────┘
```

### 9.4. Savat saqlash

- **Guest (autentifikatsiyasiz):** `Zustand` + `localStorage` — local savat
- **Autentifikatsiyalangan:** API orqali server-side savat + local sync
- **Merge:** Foydalanuvchi login qilganda local savat API savatga merge qilinadi

---

## 10. Checkout

### 10.1. Step-by-step checkout (bitta sahifada scroll)

```
┌─────────────────────────────────┐
│ ← Buyurtma berish               │
├─────────────────────────────────┤
│                                 │
│  ❶ Yetkazish manzili            │  ← Section header (active)
│  ┌─────────────────────────┐   │
│  │ 📍 Uy                    │   │  ← Saqlangan manzillar
│  │ Toshkent, Chilonzor,    │   │     Radio button tanlash
│  │ 12-kvartal, 5-uy        │   │
│  │ ● Tanlangan              │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 📍 Ish                   │   │
│  │ Toshkent, Mirzo Ulug...  │   │
│  │ ○                        │   │
│  └─────────────────────────┘   │
│  [+ Yangi manzil qo'shish]     │  ← /profile/addresses/new ga
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ❷ Yetkazish usuli              │
│  ┌─────────────────────────┐   │
│  │ 🚚 Yetkazib berish       │   │
│  │ 1-2 kun, 15,000 so'm     │   │
│  │ ● Tanlangan              │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 🏪 O'zi olib ketish      │   │
│  │ Bepul                    │   │
│  │ ○                        │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ❸ To'lov usuli                 │
│  ┌─────────────────────────┐   │
│  │ 💳 Click                  │   │
│  │ ● Online to'lov          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 💳 Payme                  │   │
│  │ ○ Online to'lov          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 💵 Naqd to'lov            │   │
│  │ ○ Yetkazib berishda      │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  📝 Izoh (ixtiyoriy)            │
│  ┌─────────────────────────┐   │
│  │ Qo'ng'iroq qilmang...   │   │  ← Textarea, max 500 belgi
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Buyurtma xulosasi              │
│  Mahsulotlar (3)    205,000     │
│  Chegirma           -41,000     │
│  Yetkazib berish     15,000     │
│  ─────────────────────────────  │
│  Jami               179,000 so'm│
│                                 │
├─────────────────────────────────┤
│                                 │
│  ████ To'lash — 179,000  █████ │  ← MainButton
│                                 │
└─────────────────────────────────┘
```

### 10.2. MainButton bosilgandan keyin

1. MainButton `showProgress(true)` — loading holat
2. API: `POST /storefront/checkout` yuboriladi
3. Muvaffaqiyatli → to'lov usulga qarab:
   - **Click/Payme:** Provider to'lov sahifasiga redirect (Telegram.WebApp.openLink yoki ichki WebView)
   - **Naqd:** Darhol order-success sahifasiga o'tish
4. To'lov callback muvaffaqiyatli → `/order-success/:orderId` ga navigate
5. Xato bo'lsa → Toast notification: "Xatolik yuz berdi. Qayta urinib ko'ring."

---

## 11. Buyurtmalar tarixi va tracking

### 11.1. Buyurtmalar ro'yxati

```
┌─────────────────────────────────┐
│ ← Buyurtmalar                   │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ #1234          Yetkazildi│   │  ← Order number + status badge
│  │ 12-fev, 2026             │   │     Status: rang bilan (yashil)
│  │                          │   │
│  │ 📷📷📷 +2                 │   │  ← Mahsulot rasmlari stack
│  │                          │   │
│  │ 3 ta mahsulot            │   │
│  │ 179,000 so'm          →  │   │  ← Jami narx + chevron
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ #1233       Yetkazilmoqda│   │     Status: ko'k
│  │ 10-fev, 2026             │   │
│  │ 📷📷 +1                   │   │
│  │ 2 ta mahsulot            │   │
│  │ 95,000 so'm           →  │   │
│  └─────────────────────────┘   │
│                                 │
│  === Bo'sh holat ============== │
│                                 │
│  📦 Buyurtmalar yo'q            │
│  Birinchi buyurtmangizni        │
│  bering!                        │
│  [ Katalogga o'tish ]           │
│                                 │
└─────────────────────────────────┘
```

### 11.2. Buyurtma tafsiloti + Tracking

```
┌─────────────────────────────────┐
│ ← Buyurtma #1234                │
├─────────────────────────────────┤
│                                 │
│  Status: 🟢 Yetkazilmoqda       │
│                                 │
│  ── Status Timeline ──────────  │
│                                 │
│  ✅ Buyurtma berildi             │  ← Completed (yashil check)
│     12-fev 14:30                │
│     │                           │
│  ✅ To'lov qabul qilindi        │
│     12-fev 14:32                │
│     │                           │
│  ✅ Tayyorlanmoqda               │
│     12-fev 15:00                │
│     │                           │
│  🔵 Yetkazilmoqda               │  ← Current (ko'k, pulsing dot)
│     13-fev 10:00                │
│     Kuryer: +998 90 123-45-67   │     ← Telefon raqam (bosilsa qo'ng'iroq)
│     │                           │
│  ○  Yetkazildi                  │  ← Pending (kulrang)
│     Taxminiy: 13-fev 12:00-14:00│
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Buyurtma tarkibi                │
│  ┌─────────────────────────┐   │
│  │ 📷  Mahsulot #1          │   │
│  │     Qora, L | 2 dona     │   │
│  │     80,000 × 2 = 160,000│   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 📷  Mahsulot #2          │   │
│  │     1 dona               │   │
│  │     45,000               │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Yetkazish manzili              │
│  📍 Toshkent, Chilonzor,       │
│     12-kvartal, 5-uy            │
│                                 │
│  To'lov                         │
│  💳 Click | To'langan           │
│                                 │
│  ─────────────────────────────  │
│  Mahsulotlar         205,000    │
│  Chegirma            -41,000    │
│  Yetkazish            15,000    │
│  Jami                179,000 so'm│
│                                 │
│  ─────────────────────────────  │
│  [📞 Qo'llab-quvvatlash]       │  ← Bot ga /help yuboradi
│  [🔄 Qayta buyurtma berish]     │  ← Barcha mahsulotlarni savatga
│                                 │
└─────────────────────────────────┘
```

### 11.3. Status badge ranglari

| Status | Rang | Badge |
|--------|------|-------|
| `pending` | Sariq | 🟡 Kutilmoqda |
| `confirmed` | Ko'k | 🔵 Tasdiqlangan |
| `processing` | Ko'k | 🔵 Tayyorlanmoqda |
| `delivering` | Ko'k (pulsing) | 🔵 Yetkazilmoqda |
| `delivered` | Yashil | 🟢 Yetkazildi |
| `cancelled` | Qizil | 🔴 Bekor qilindi |
| `returned` | Kulrang | ⚫ Qaytarildi |

---

## 12. Profil va manzillar

### 12.1. Profil sahifasi

```
┌─────────────────────────────────┐
│ ← Profil                        │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │  👤  Aziz Karimov         │   │  ← Telegram avatar + ism
│  │  📱 +998 90 123-45-67    │   │     Telegram'dan olinadi
│  │  @azizkarimov             │   │     Username (agar mavjud)
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │  ← Telegram stilidagi section
│  │ 📦 Buyurtmalarim      →  │   │
│  │─────────────────────────│   │
│  │ 📍 Manzillarim         →  │   │
│  │─────────────────────────│   │
│  │ ❤️ Sevimlilar           →  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🌐 Til                UZ→ │   │  ← Tilni tanlash
│  │─────────────────────────│   │
│  │ 📞 Aloqa              →  │   │     Bot ga /help
│  │─────────────────────────│   │
│  │ ℹ️ Biz haqimizda       →  │   │
│  └─────────────────────────┘   │
│                                 │
│  E-Store v1.0                   │  ← Versiya (pastda, hint color)
│                                 │
└─────────────────────────────────┘
```

### 12.2. Manzillar ro'yxati

```
┌─────────────────────────────────┐
│ ← Manzillar                     │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📍 Uy (asosiy)       ✏️🗑 │   │  ← Label + edit/delete
│  │ Toshkent, Chilonzor,    │   │
│  │ 12-kvartal, 5-uy, 23    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📍 Ish                ✏️🗑 │   │
│  │ Toshkent, Mirzo Ulug'bek│   │
│  │ 45-uy                    │   │
│  └─────────────────────────┘   │
│                                 │
│  [+ Yangi manzil qo'shish]     │  ← Outlined button
│                                 │
└─────────────────────────────────┘
```

### 12.3. Manzil qo'shish formasi

```
┌─────────────────────────────────┐
│ ← Manzil qo'shish               │
├─────────────────────────────────┤
│                                 │
│  Label                          │
│  [Uy / Ish / Boshqa _____]     │  ← Chip select yoki custom input
│                                 │
│  Shahar *                       │
│  [Toshkent            ▼]       │  ← Dropdown select
│                                 │
│  Tuman *                        │
│  [Chilonzor           ▼]       │  ← Dropdown select
│                                 │
│  To'liq manzil *                │
│  [12-kvartal, 5-uy, 23-xon ]   │  ← Text input
│                                 │
│  Mo'ljal (ixtiyoriy)            │
│  [Metro yonida, yashil bino ]   │  ← Text input
│                                 │
│  📍 Xaritada ko'rsatish         │  ← Bosilsa xarita ochiladi
│  [========= Xarita =========]  │     Pin qo'yish mumkin
│  [=========================]   │     (agar LocationManager mavjud)
│                                 │
│  ☐ Asosiy manzil qilish         │  ← Checkbox
│                                 │
├─────────────────────────────────┤
│  ████  Saqlash  ████████████   │  ← MainButton
└─────────────────────────────────┘
```

---

## 13. Telegram Bot komandalar

### 13.1. Komandalar ro'yxati

| Komanda | Tavsif | Javob |
|---------|--------|-------|
| `/start` | Botni birinchi marta ochish | Salomlash xabari + Mini App ochish tugmasi (WebApp button) |
| `/start product_{slug}` | Deep link — mahsulot sahifasi | Mini App ochiladi, mahsulot sahifasiga yo'naltiriladi |
| `/start category_{slug}` | Deep link — kategoriya | Mini App ochiladi, kategoriya sahifasiga yo'naltiriladi |
| `/start order_{id}` | Deep link — buyurtma tracking | Mini App ochiladi, buyurtma sahifasiga yo'naltiriladi |
| `/orders` | Buyurtmalar ro'yxati | Inline keyboard: oxirgi 5 ta buyurtma + "Barchasini ko'rish" tugmasi |
| `/help` | Yordam | Aloqa ma'lumotlari + FAQ inline keyboard |
| `/language` | Til tanlash | Inline keyboard: 🇺🇿 O'zbekcha, 🇷🇺 Русский, 🇬🇧 English |
| `/settings` | Sozlamalar | Notification on/off, til tanlash |

### 13.2. /start xabari

```
Assalomu alaykum, {first_name}! 👋

{company_name} do'koniga xush kelibsiz!

🛍 Mahsulotlarimizni ko'ring va buyurtma bering.

[🛒 Do'konni ochish]  ← WebApp button (Mini App ochadi)
```

### 13.3. Buyurtma notification xabarlari

Bot orqali foydalanuvchiga yuboriladi:

| Event | Xabar |
|-------|-------|
| Buyurtma qabul qilindi | "✅ Buyurtma #{number} qabul qilindi!\n💰 Jami: {total} so'm\n\n[📦 Buyurtmani ko'rish]" |
| To'lov tasdiqlandi | "💳 Buyurtma #{number} uchun to'lov qabul qilindi." |
| Tayyorlanmoqda | "📦 Buyurtma #{number} tayyorlanmoqda..." |
| Yetkazilmoqda | "🚚 Buyurtma #{number} yetkazilmoqda!\nKuryer: {driver_phone}\nTaxminiy: {estimated_time}" |
| Yetkazildi | "🎉 Buyurtma #{number} yetkazildi!\n\n⭐ Baholang: [Sharh qoldirish]" |
| Bekor qilindi | "❌ Buyurtma #{number} bekor qilindi.\nSabab: {reason}" |

### 13.4. Inline mode

Foydalanuvchi boshqa chat'da `@bot_username mahsulot_nomi` yozganda:

```
┌─────────────────────────────────┐
│ 📷 Samsung Galaxy S24            │
│ 💰 12,500,000 so'm               │
│ [Ko'rish va buyurtma berish →]   │  ← Bosilsa Mini App ochiladi
└─────────────────────────────────┘
```

Bu mahsulotni chat'ga ulashish imkonini beradi — viral marketing uchun.

---

## 14. Telegram Web Apps SDK integratsiya

### 14.1. Ishlatilgan SDK metodlar

| Metod | Qachon ishlatiladi |
|-------|--------------------|
| `Telegram.WebApp.ready()` | App yuklangandan keyin — Telegram'ga "tayyor" signal |
| `Telegram.WebApp.expand()` | App ochilganda — to'liq ekran rejimi |
| `Telegram.WebApp.close()` | App yopish (masalan, buyurtmadan keyin) |
| `Telegram.WebApp.MainButton` | Savatga qo'shish, checkout, to'lov tugmalari |
| `Telegram.WebApp.BackButton` | Orqaga navigatsiya (React Router bilan sync) |
| `Telegram.WebApp.HapticFeedback` | Touch feedback — tap, success, error |
| `Telegram.WebApp.showConfirm()` | Tasdiqlash dialoglar (o'chirish, bekor qilish) |
| `Telegram.WebApp.showAlert()` | Xato xabarlari |
| `Telegram.WebApp.showPopup()` | Maxsus popup (tugmalar bilan) |
| `Telegram.WebApp.enableClosingConfirmation()` | Savat bo'sh bo'lmaganda app yopishdan oldin tasdiqlash |
| `Telegram.WebApp.initDataUnsafe` | Foydalanuvchi ma'lumotlari (id, first_name, photo) |
| `Telegram.WebApp.themeParams` | Tema ranglari (dark/light) |
| `Telegram.WebApp.colorScheme` | 'dark' yoki 'light' |
| `Telegram.WebApp.openLink(url)` | Tashqi link ochish (to'lov sahifasi) |
| `Telegram.WebApp.openTelegramLink(url)` | Telegram ichki link (support chat) |
| `Telegram.WebApp.sendData(data)` | Bot'ga ma'lumot yuborish (inline mode) |
| `Telegram.WebApp.switchInlineQuery()` | Inline mode ochish (mahsulot ulashish) |
| `Telegram.WebApp.requestContact()` | Telefon raqam so'rash (ro'yxat uchun) |
| `Telegram.WebApp.CloudStorage` | Kichik ma'lumotlar saqlash (savat, preferences) |

### 14.2. BackButton + React Router integratsiyasi

```
React Router location o'zgarganda:
  - Agar route = '/' (home) → BackButton.hide()
  - Agar route != '/' → BackButton.show()
  - BackButton.onClick → navigate(-1) (orqaga qaytish)
```

### 14.3. MainButton boshqarish

Har bir sahifada MainButton boshqacha ishlaydi:

| Sahifa | MainButton | Harakat |
|--------|-----------|---------|
| Home | Yashirin | - |
| Katalog | Yashirin | - |
| Mahsulot | "Savatga qo'shish — {narx}" | Savatga qo'shish |
| Savat | "Buyurtma berish — {jami}" | /checkout ga navigate |
| Checkout | "To'lash — {jami}" | Buyurtma yaratish |
| Orders | Yashirin | - |
| Profil | Yashirin | - |

---

## 15. Navigatsiya tizimi

### 15.1. Bottom Tab Bar

```
┌────────┬────────┬────────┬────────┐
│  🏠    │  📦    │  🛒    │  👤    │
│ Bosh   │Katalog │ Savat  │ Profil │
│        │        │  (3)   │        │  ← Savat badge (qizil, item count)
└────────┴────────┴────────┴────────┘
```

**Dizayn:**
- Balandlik: 56px + safe area bottom
- Fon: `var(--tg-theme-bg-color)` + yuqori border (1px, separator)
- Aktiv tab: `var(--tg-theme-button-color)` rang
- Noaktiv tab: `var(--tg-theme-hint-color)` rang
- Savat badge: qizil doira (16px), oq raqam, item soni ko'rsatadi
- Badge animatsiya: yangi item qo'shilganda `scale` bounce (300ms)

### 15.2. Tab almashtirish xatti-harakati

- Tab bosilganda shu tab'ning asosiy sahifasiga o'tish
- Agar shu tab allaqachon aktiv bo'lsa — yuqoriga scroll (scroll-to-top)
- Har bir tab o'z navigation stack'ini saqlaydi (tab almashtirganda pozitsiya saqlanadi)

---

## 16. Animatsiya va mikro-interaksiyalar

### 16.1. Sahifa o'tishlari

| O'tish | Animatsiya | Davomiylik |
|--------|-----------|------------|
| Tab almashtirish | Fade (opacity 0→1) | 150ms |
| Push (ilgari) | Slide from right | 200ms ease-out |
| Pop (orqaga) | Slide to right | 200ms ease-out |
| Modal/Bottom Sheet | Slide from bottom + backdrop fade | 250ms |

### 16.2. Mikro-interaksiyalar

| Element | Animatsiya | Trigger |
|---------|-----------|---------|
| "Savatga qo'shish" tugma | Scale 1→0.95→1 + check icon appear | Tap |
| Savat badge | Scale 0→1.2→1 (bounce) | Yangi item |
| Skeleton → content | Fade in (opacity 0→1) | Data loaded |
| Pull to refresh | Spinner rotate | Pull down |
| Card press | Scale 0.98 + slight dim | Touch start |
| Toast notification | Slide down + auto-hide | Event |
| Heart (sevimli) | Scale 1→1.3→1 + fill color | Tap |
| Miqdor counter | Number flip (±1) | +/- tap |

### 16.3. HapticFeedback ishlatish

| Event | Feedback turi |
|-------|--------------|
| Tab bar tap | `selectionChanged()` |
| Card tap | `selectionChanged()` |
| Savatga qo'shish | `impactOccurred('light')` |
| Miqdor +/- | `impactOccurred('light')` |
| Promo-kod muvaffaqiyatli | `notificationOccurred('success')` |
| Promo-kod xato | `notificationOccurred('error')` |
| Checkout muvaffaqiyat | `impactOccurred('heavy')` |
| O'chirish | `notificationOccurred('warning')` |
| Xato (API fail) | `notificationOccurred('error')` |
| Pull to refresh | `impactOccurred('light')` |

---

## 17. Performance va optimallashtirish

### 17.1. Rasmlar

| Strategiya | Tavsif |
|-----------|--------|
| WebP format | Barcha rasmlar WebP (30-50% kichikroq) |
| Responsive sizes | Card: 200×200, Product: 400×400, Banner: 768×400 |
| Lazy loading | `loading="lazy"` + Intersection Observer |
| Blurhash placeholder | Yuklangunga qadar blur rasm ko'rsatish (10 bayt hash) |
| CDN | MinIO/S3 oldidan CDN (CloudFlare yoki Bunny CDN) |
| Progressive JPEG | Katta rasmlar uchun — avval sifatsiz, keyin sifatli |

### 17.2. API optimallashtirish

| Strategiya | Tavsif |
|-----------|--------|
| Aggregated endpoints | `/storefront/home` — bitta so'rovda barcha home data |
| Pagination | Cursor-based, per_page=20 |
| Field selection | `?fields=id,name,price,image` — kerak bo'lmagan ma'lumotni olib kelmaslik |
| React Query cache | staleTime: 5 min, cacheTime: 30 min |
| Prefetch | Kategoriya chip hover/tap'da keyingi sahifa prefetch |
| Optimistic updates | Savatga qo'shish — UI darhol yangilanadi, API background'da |

### 17.3. Bundle size

| Maqsad | Usul |
|--------|------|
| < 150 KB gzip (initial) | Code splitting per route (React.lazy) |
| Zustand | ~2 KB (Redux o'rniga) |
| date-fns | Faqat kerakli funksiyalar import (tree-shaking) |
| Rasm library | Yo'q — native `<img>` + CSS |
| Animation | CSS transitions (framer-motion emas) |

### 17.4. Loading holatlari

| Holat | Ko'rinish |
|-------|----------|
| Initial load | Splash screen: kompaniya logo + spinner (max 2 sek) |
| Sahifa navigatsiya | Skeleton screen (card/list shaklidagi kulrang bloklar) |
| API so'rov | Inline spinner yoki skeleton |
| Rasm yuklanmoqda | Blurhash → fade-in real image |
| Infinite scroll | 2 ta skeleton card pastda |
| MainButton loading | `MainButton.showProgress(true)` |

---

## 18. Offline va xato holatlar

### 18.1. Tarmoq yo'q holati

```
┌─────────────────────────────────┐
│                                 │
│        📡                       │
│                                 │
│  Internet aloqasi yo'q          │
│  Tarmoqqa ulanib qayta          │
│  urinib ko'ring                 │
│                                 │
│  [ Qayta yuklash ]              │
│                                 │
└─────────────────────────────────┘
```

- Savat local'da saqlanadi — offline ham ko'rish mumkin
- Katalog cache'dan ko'rsatiladi (React Query cache)
- Write operatsiyalar (checkout) bloklanadi + xabar ko'rsatiladi

### 18.2. API xato holatlari

| Xato | UI javob |
|------|----------|
| 422 (Validation) | Form field'lari ostida qizil xato matn |
| 401 (Unauthorized) | Telegram initData qayta yuboriladi (silent re-auth) |
| 403 (Forbidden) | Toast: "Ruxsat berilmagan" |
| 404 (Not Found) | "Mahsulot topilmadi" sahifasi |
| 429 (Rate Limit) | Toast: "Juda ko'p so'rov. Biroz kuting." |
| 500 (Server Error) | Toast: "Serverda xatolik. Qayta urinib ko'ring." + retry tugma |
| Timeout (10 sek) | Toast: "So'rov uzoq davom etdi" + retry |

### 18.3. Bo'sh holatlar (Empty States)

Har bir ro'yxat uchun maxsus bo'sh holat dizayni:

| Sahifa | Icon | Matn | CTA |
|--------|------|------|-----|
| Savat | 🛒 | "Savat bo'sh" | Katalogga o'tish |
| Buyurtmalar | 📦 | "Buyurtmalar yo'q" | Katalogga o'tish |
| Qidirish (natija yo'q) | 😔 | "Topilmadi" | Boshqa kalit so'z |
| Sevimlilar | ❤️ | "Sevimlilar bo'sh" | Katalogga o'tish |
| Manzillar | 📍 | "Manzillar yo'q" | Manzil qo'shish |

---

## 19. Notification tizimi

### 19.1. In-App Notifications (Toast)

Mini App ichidagi tezkor bildirishnomalar:

| Tur | Dizayn | Davomiylik |
|-----|--------|------------|
| Success | Yashil chap border, ✅ icon | 3 soniya, auto-hide |
| Error | Qizil chap border, ❌ icon | 5 soniya, manual dismiss |
| Info | Ko'k chap border, ℹ️ icon | 3 soniya, auto-hide |
| Warning | Sariq chap border, ⚠️ icon | 4 soniya, auto-hide |

Toast joylashuvi: ekranning yuqorisida, slide-down animatsiya.

### 19.2. Bot Push Notifications

Bot orqali Telegram chat'ga yuboriladi (foydalanuvchi blokirovka qilmagan bo'lsa):

- Buyurtma status o'zgarishlari (tasdiqlandi, yetkazilmoqda, yetkazildi)
- To'lov holati (muvaffaqiyatli, muvaffaqiyatsiz)
- Aksiya va chegirmalar (kompaniya Admin yuborganda)
- Buyurtma eslatmasi (savat tashlab ketilganda — 24 soatdan keyin)

### 19.3. Abandoned Cart Notification

Foydalanuvchi savatga mahsulot qo'shib, checkout qilmay ketsa:

- **24 soatdan keyin:** Bot xabar yuboradi: "🛒 Savatingizda {n} ta mahsulot bor! Buyurtmani yakunlang → [Do'konni ochish]"
- **72 soatdan keyin (agar birinchisiga javob bo'lmasa):** "Sevimli mahsulotlaringiz hali savatda kutmoqda! 🛍 [Do'konni ochish]"
- **Faqat bitta marta yuboriladi** (spam oldini olish)

---

## 20. API Endpoints (Mini App uchun)

### 20.1. Autentifikatsiya

Barcha Mini App so'rovlari `Authorization: tma {initData}` header bilan yuboriladi. Backend `initData` ni Telegram Bot API secret bilan HMAC-SHA256 orqali tekshiradi.

### 20.2. Endpoint'lar

| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| GET | `/api/v1/storefront/init` | Kompaniya branding, sozlamalar | - |
| GET | `/api/v1/storefront/home` | Bosh sahifa: bannerlar, kategoriyalar, mahsulotlar | - |
| GET | `/api/v1/storefront/categories` | Kategoriyalar daraxti | - |
| GET | `/api/v1/storefront/products` | Mahsulotlar (filter, sort, paginate) | - |
| GET | `/api/v1/storefront/products/{slug}` | Mahsulot tafsiloti | - |
| GET | `/api/v1/storefront/search` | Qidirish natijalari | - |
| GET | `/api/v1/storefront/search/popular` | Mashxur qidiruvlar | - |
| GET | `/api/v1/storefront/banners?placement={key}` | Banner'lar | - |
| POST | `/api/v1/storefront/banners/{id}/impression` | Banner ko'rish qayd | - |
| GET | `/api/v1/storefront/cart` | Savat olish | ✅ |
| POST | `/api/v1/storefront/cart` | Savatga qo'shish | ✅ |
| PUT | `/api/v1/storefront/cart/{itemId}` | Savat item yangilash (miqdor) | ✅ |
| DELETE | `/api/v1/storefront/cart/{itemId}` | Savatdan o'chirish | ✅ |
| POST | `/api/v1/storefront/cart/promo` | Promo-kod qo'llash | ✅ |
| DELETE | `/api/v1/storefront/cart/promo` | Promo-kod olib tashlash | ✅ |
| POST | `/api/v1/storefront/checkout` | Buyurtma yaratish | ✅ |
| GET | `/api/v1/storefront/orders` | Buyurtmalar ro'yxati | ✅ |
| GET | `/api/v1/storefront/orders/{id}` | Buyurtma tafsiloti + tracking | ✅ |
| POST | `/api/v1/storefront/orders/{id}/reorder` | Qayta buyurtma (savatga) | ✅ |
| GET | `/api/v1/storefront/profile` | Profil ma'lumotlari | ✅ |
| GET | `/api/v1/storefront/addresses` | Manzillar ro'yxati | ✅ |
| POST | `/api/v1/storefront/addresses` | Manzil qo'shish | ✅ |
| PUT | `/api/v1/storefront/addresses/{id}` | Manzil tahrirlash | ✅ |
| DELETE | `/api/v1/storefront/addresses/{id}` | Manzil o'chirish | ✅ |
| GET | `/api/v1/storefront/favorites` | Sevimlilar ro'yxati | ✅ |
| POST | `/api/v1/storefront/favorites/{productId}` | Sevimlilarga qo'shish | ✅ |
| DELETE | `/api/v1/storefront/favorites/{productId}` | Sevimlilardan olib tashlash | ✅ |
| GET | `/api/v1/storefront/promotions` | Aktiv aksiyalar | - |

---

## 21. Texnik implementatsiya

### 21.1. Loyiha tuzilmasi

```
telegram-mini-app/
├── public/
│   └── index.html
├── src/
│   ├── app/
│   │   ├── App.tsx              # Root component + routing
│   │   ├── router.tsx           # React Router config
│   │   └── providers.tsx        # QueryClient, ThemeProvider
│   ├── components/
│   │   ├── ui/                  # Umumiy UI komponentlar
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Spinner.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx   # Grid card (2 ustunli)
│   │   │   ├── ProductGrid.tsx   # 2 ustunli grid container
│   │   │   └── ProductSection.tsx # Section header + grid
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── layout/
│   │   │   ├── TabBar.tsx        # Bottom navigation
│   │   │   ├── SearchBar.tsx     # Sticky search input
│   │   │   └── PageLayout.tsx    # Sahifa wrapper
│   │   └── home/
│   │       ├── HeroBanner.tsx    # Banner slider
│   │       ├── CategoryChips.tsx # Horizontal chips
│   │       └── HomeSections.tsx  # Dinamik section'lar
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Catalog.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Search.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderSuccess.tsx
│   │   ├── Orders.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── Profile.tsx
│   │   ├── Addresses.tsx
│   │   └── AddressForm.tsx
│   ├── hooks/
│   │   ├── useTelegram.ts       # Telegram SDK wrapper
│   │   ├── useMainButton.ts     # MainButton boshqarish
│   │   ├── useBackButton.ts     # BackButton + Router sync
│   │   ├── useHaptic.ts         # HapticFeedback wrapper
│   │   ├── useCart.ts            # Savat operatsiyalari
│   │   └── useInfiniteProducts.ts # Infinite scroll
│   ├── store/
│   │   ├── cartStore.ts         # Zustand — savat state
│   │   ├── authStore.ts         # Zustand — auth state (initData)
│   │   └── appStore.ts          # Zustand — umumiy app state
│   ├── api/
│   │   ├── client.ts            # Axios instance (base URL, interceptors)
│   │   ├── storefront.ts        # Storefront API funksiyalar
│   │   └── types.ts             # TypeScript interface'lar
│   ├── lib/
│   │   ├── telegram.ts          # Telegram WebApp init + helpers
│   │   ├── format.ts            # Narx formatlash, sana formatlash
│   │   └── cn.ts                # Tailwind class merge utility
│   └── styles/
│       └── global.css           # Tailwind + Telegram CSS variables
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 21.2. Muhim texnik yechimlar

**Telegram initData validatsiya (Backend):**

Laravel middleware `ValidateTelegramInitData`:
1. `Authorization: tma {initData}` header'dan initData olinadi
2. `initData` parse qilinadi (URL encoded string)
3. `data_check_string` hosil qilinadi (sorted key=value, `\n` bilan ajratilgan, hash'siz)
4. `HMAC_SHA256(HMAC_SHA256(bot_token, "WebAppData"), data_check_string)` hisoblanadi
5. Natija initData'dagi `hash` bilan taqqoslanadi
6. `auth_date` tekshiriladi (24 soatdan eski bo'lsa — rad etish)
7. Muvaffaqiyatli → `user_id`, `first_name`, va h.k. request'ga biriktiriladi

**Multi-bot routing (Backend):**

Webhook URL: `https://api.estore.uz/webhook/telegram/{bot_token_hash}`

1. Webhook keladi → `bot_token_hash` dan `telegram_bots` jadvalida bot topiladi
2. Bot'ning `company_id` si aniqlanadi
3. Keyin company kontekstida xabar qayta ishlanadi

**CloudStorage (Mini App local data):**

Telegram `CloudStorage` API orqali kichik ma'lumotlar saqlash:
- `cart_items` — savat (offline support)
- `search_history` — qidirish tarixi
- `preferred_language` — tanlangan til
- Max 1024 key, har biri max 4096 bayt

### 21.3. Deploy

- Mini App = statik React build → CDN'ga deploy (Vercel, Cloudflare Pages, yoki MinIO)
- Bot webhook = Laravel endpoint, mavjud API serverda
- Mini App URL: `https://miniapp.estore.uz/{company_slug}/` yoki `https://{company_slug}.miniapp.estore.uz/`
- BotFather'da MenuButton → Mini App URL o'rnatiladi

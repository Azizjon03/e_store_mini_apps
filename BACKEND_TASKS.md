# StoreX Backend Tasks (Laravel API)

Backend API da qo'shimcha yoki o'zgartirish kerak bo'lgan endpointlar.
Frontend redesign asosida zarur bo'lgan backend ishlar.

---

## 1. Store Config (`/api/v1/storefront/init`) — O'ZGARTIRISH

Hozirgi `StoreConfig` ga qo'shimcha maydonlar kerak:

```json
{
  "company_id": 1,
  "company_name": "TechStore",
  "logo": "https://...",
  "accent_color": "#2196F3",
  "primary_color": "#1976D2",
  "secondary_color": "#FF5722",
  "theme": "light",
  "languages": ["uz", "ru"],
  "currency": "UZS",
  "currency_symbol": "so'm",
  "phone": "+998901234567",
  "email": "info@techstore.uz",
  "social_links": {
    "telegram": "@techstore",
    "instagram": "@techstore_uz"
  },
  "delivery_info": {
    "free_delivery_from": 200000,
    "min_order_amount": 50000,
    "delivery_cost": 15000
  },
  "working_hours": "09:00-21:00",
  "pickup_points": [
    {
      "id": 1,
      "name": "Chilonzor filiali",
      "address": "Chilonzor t., Bunyodkor ko'chasi 12",
      "lat": 41.2856,
      "lng": 69.2044,
      "working_hours": "10:00-20:00"
    }
  ]
}
```

### Kerak bo'lgan o'zgarishlar:
- [ ] `secondary_color` — ikkinchi brend rangi
- [ ] `currency_symbol` — narx formatlash uchun
- [ ] `social_links` — profil sahifasida ko'rsatish
- [ ] `delivery_info` — checkout va cart da bepul yetkazish chegarasini ko'rsatish
- [ ] `working_hours` — do'kon ish vaqti
- [ ] `pickup_points[]` — olib ketish manzillari (checkout uchun)

---

## 2. Home Page (`/api/v1/storefront/home`) — O'ZGARTIRISH

Hozirgi response yaxshi, lekin qo'shimchalar kerak:

```json
{
  "banners": [...],
  "banners_mid": [...],
  "categories": [...],
  "sections": [...],
  "flash_sale": {
    "title": "Flash Sale",
    "ends_at": "2026-03-29T18:00:00Z",
    "products": [...]
  }
}
```

### Kerak bo'lgan o'zgarishlar:
- [ ] `flash_sale` — countdown timer bilan maxsus aksiya (ixtiyoriy)
- [ ] `categories[].color` — kategoriya fon rangi (ikonka orqa foni)
- [ ] `sections[].layout` — `grid` yoki `horizontal` (UI da qanday ko'rsatish)

---

## 3. Products Filter (`/api/v1/storefront/products`) — O'ZGARTIRISH

Filter bottom sheet uchun qo'shimcha parametrlar:

### Kerak bo'lgan o'zgarishlar:
- [ ] `GET /products/filters` — yangi endpoint, mavjud filtr opsiyalarini qaytaradi:
```json
{
  "price_range": { "min": 5000, "max": 15000000 },
  "brands": [
    { "id": 1, "name": "Samsung", "count": 45 },
    { "id": 2, "name": "Apple", "count": 32 }
  ],
  "categories": [
    { "id": 1, "name": "Elektronika", "slug": "elektronika", "count": 120 }
  ],
  "attributes": [
    { "name": "Rang", "values": ["Qora", "Oq", "Ko'k"] },
    { "name": "Xotira", "values": ["64GB", "128GB", "256GB"] }
  ]
}
```
- [ ] Response meta ga `applied_filters_count` qo'shish

---

## 4. Search (`/api/v1/storefront/search`) — O'ZGARTIRISH

### Kerak bo'lgan o'zgarishlar:
- [ ] `GET /search/suggestions?q=sam` — autocomplete endpoint:
```json
{
  "suggestions": [
    "samsung galaxy s24",
    "samsung quloqchin",
    "samsung zaryadka"
  ]
}
```
- [ ] `GET /search/popular` — allaqachon bor, OK

---

## 5. Cart (`/api/v1/storefront/tg/cart`) — O'ZGARTIRISH

### Kerak bo'lgan o'zgarishlar:
- [ ] `GET /tg/cart` response ga qo'shimcha:
```json
{
  "items": [...],
  "total_price": 450000,
  "discount": 25000,
  "promo_code": "SALE10",
  "delivery_cost": 15000,
  "free_delivery_remaining": 50000,
  "estimated_delivery": "Bugun, 17:00-19:00"
}
```
- [ ] `free_delivery_remaining` — bepul yetkazishgacha qolgan summa
- [ ] `estimated_delivery` — taxminiy yetkazish vaqti

---

## 6. Checkout (`/api/v1/storefront/tg/checkout`) — O'ZGARTIRISH

### Kerak bo'lgan o'zgarishlar:
- [ ] `GET /tg/checkout/delivery-slots` — mavjud yetkazish vaqtlari:
```json
{
  "today": [
    { "id": 1, "time": "14:00-16:00", "available": true },
    { "id": 2, "time": "16:00-18:00", "available": true },
    { "id": 3, "time": "18:00-20:00", "available": false }
  ],
  "tomorrow": [
    { "id": 4, "time": "10:00-12:00", "available": true },
    { "id": 5, "time": "12:00-14:00", "available": true }
  ]
}
```

- [ ] `POST /tg/checkout` request ga qo'shimcha:
```json
{
  "delivery_slot_id": 2,
  "pickup_point_id": null
}
```

- [ ] `GET /tg/checkout/payment-methods` — mavjud to'lov usullari:
```json
{
  "methods": [
    { "id": "payme", "name": "Payme", "icon": "payme.svg", "available": true },
    { "id": "click", "name": "Click", "icon": "click.svg", "available": true },
    { "id": "cash", "name": "Naqd pul", "icon": "cash.svg", "available": true }
  ]
}
```

---

## 7. Orders (`/api/v1/storefront/tg/orders`) — O'ZGARTIRISH

### Kerak bo'lgan o'zgarishlar:
- [ ] `GET /tg/orders?status=delivering` — status bo'yicha filtrlash
- [ ] `GET /tg/orders/{id}` response ga qo'shimcha:
```json
{
  "tracking": [
    {
      "status": "accepted",
      "title": "Qabul qilindi",
      "timestamp": "2026-03-25T14:30:00Z",
      "completed": true
    },
    {
      "status": "preparing",
      "title": "Tayyorlanmoqda",
      "timestamp": "2026-03-25T15:00:00Z",
      "completed": true
    },
    {
      "status": "delivering",
      "title": "Yo'lda",
      "timestamp": "2026-03-25T16:45:00Z",
      "completed": true,
      "driver": {
        "name": "Abdullayev Jasur",
        "phone": "+998901234567"
      }
    },
    {
      "status": "delivered",
      "title": "Yetkazildi",
      "timestamp": null,
      "completed": false
    }
  ],
  "estimated_delivery": "17:30-18:00",
  "payment_method_name": "Payme",
  "payment_method_icon": "payme.svg"
}
```
- [ ] `tracking[].driver` — kuryer ma'lumotlari
- [ ] `estimated_delivery` — taxminiy vaqt
- [ ] `payment_method_name/icon` — to'lov usuli nomi va ikonkasi

---

## 8. Profile (`/api/v1/storefront/tg/profile`) — O'ZGARTIRISH

### Kerak bo'lgan o'zgarishlar:
- [ ] Response ga statistika qo'shish:
```json
{
  "id": 1,
  "first_name": "Abduvohid",
  "last_name": "Abduhalilov",
  "phone": "+998901234567",
  "photo_url": "...",
  "stats": {
    "orders_count": 5,
    "favorites_count": 12,
    "addresses_count": 2
  }
}
```
- [ ] `stats` — profil sahifasida quick stats ko'rsatish uchun

---

## 9. Favorites (`/api/v1/storefront/tg/favorites`) — OK

Hozirgi API yetarli, o'zgartirish shart emas.

---

## 10. Addresses (`/api/v1/storefront/tg/addresses`) — O'ZGARTIRISH

### Kerak bo'lgan o'zgarishlar:
- [ ] `lat`, `lng` maydonlari majburiy qilish (xarita integratsiyasi uchun)
- [ ] `PUT /tg/addresses/{id}/primary` — asosiy manzilni belgilash

---

## 11. Product Reviews (`/api/v1/storefront/products/{product}/reviews`) — YANGI, BAJARILDI ✅

Product detail sahifasi `reviews_count` / `reviews_avg_rating`ni ilgaridan qaytarardi, lekin sharhlarning o'zini o'qib bo'lmasdi (`ProductDetail.reviews` frontend tipida e'lon qilingan, backend hech qachon to'ldirmagan). Backend PR: `feat/storefront-reviews` (base: `fix/storefront-integrity`), https://github.com/Azizjon03/e_store_back/pull/27.

**1. `GET /storefront/products/{product}` (detail) — `data.reviews` qo'shildi**, faqat detail javobida (katalog ro'yxatida — `GET /storefront/products` — bu kalit yo'q, qasddan: har bir mahsulot uchun sharhlarni yuklash paginatsiyalangan ro'yxatda N+1 bo'lardi). Eng so'nggi 3 ta tasdiqlangan (`approved`) sharh, yangidan eskiga:
```json
{
  "data": {
    "id": 1,
    "...": "boshqa mahsulot maydonlari",
    "reviews": [
      {
        "id": 10,
        "user_name": "Azizjon R.",
        "rating": 5,
        "title": "Zo'r mahsulot!",
        "text": "Sifati juda yaxshi, narxi ham maqul.",
        "pros": "Sifati yaxshi",
        "cons": null,
        "is_verified_purchase": true,
        "created_at": "2026-08-10T12:00:00.000000Z"
      }
    ]
  }
}
```

**2. `GET /storefront/products/{product}/reviews` — yangi endpoint**, mahsulotning barcha sharhlari, sahifalangan (standart Laravel resource-collection paginatsiyasi — `data` + `links` + `meta`):
- `product` — `show()` bilan bir xil: slug yoki id qabul qilinadi.
- Faqat `approved` status, yangidan eskiga tartiblangan.
- `?per_page=` — standart 10, maksimum 100 (`IndexProductRequest` bilan bir xil qopqoq).
- `?rating=` (ixtiyoriy) — minimal emas, aynan shu reyting bo'yicha filtr (1–5).
- Noma'lum mahsulot uchun 404.
- Har bir sharh obyekti yuqoridagi `reviews[]` elementi bilan bir xil shaklda.

Frontend tomonda e'tibor bering: `src/api/types.ts`dagi `Review` interfeysi hozircha faqat `id, user_name, rating, text, created_at`ni bilyapti — backend qo'shimcha ravishda `title`, `pros`, `cons`, `is_verified_purchase` ham qaytaradi, kerak bo'lsa tipga qo'shish mumkin. `user_photo` backend'da yo'q (mavjud emas — bunday ustun DB'da yo'q).

**Maxfiylik:** `user_name` hech qachon to'liq ism emas — "Azizjon Rahmonov" → "Azizjon R." (ism + familiya bosh harfi). Bir so'zli ism o'zgarishsiz qoladi. Foydalanuvchi bog'lanmagan yoki o'chirilgan bo'lsa — `"Mijoz"`.

---

## Yangi Endpointlar

| # | Endpoint | Method | Tavsif |
|---|----------|--------|--------|
| 1 | `/products/filters` | GET | Mavjud filtr opsiyalari (narx, brendlar, atributlar) |
| 2 | `/search/suggestions` | GET | Autocomplete qidiruv takliflari |
| 3 | `/tg/checkout/delivery-slots` | GET | Mavjud yetkazish vaqtlari |
| 4 | `/tg/checkout/payment-methods` | GET | Mavjud to'lov usullari |
| 5 | `/tg/addresses/{id}/primary` | PUT | Asosiy manzilni belgilash |
| 6 | `/products/{product}/reviews` | GET | Mahsulot sharhlari, sahifalangan (BAJARILDI ✅) |

## O'zgargan Endpointlar

| # | Endpoint | O'zgarish |
|---|----------|-----------|
| 1 | `/init` | +secondary_color, +delivery_info, +pickup_points |
| 2 | `/home` | +flash_sale, +categories[].color, +sections[].layout |
| 3 | `/tg/cart` | +free_delivery_remaining, +estimated_delivery |
| 4 | `/tg/orders` | +status filter param |
| 5 | `/tg/orders/{id}` | +tracking[].driver, +estimated_delivery |
| 6 | `/tg/profile` | +stats{} |
| 7 | `/tg/addresses` | +lat/lng required |
| 8 | `/products/{product}` (detail) | +reviews[] (faqat detail, katalog ro'yxatida yo'q) (BAJARILDI ✅) |

---

## Priority (Muhimlik tartibi)

1. **P0 (Blocker)** — `/init` + delivery_info, `/tg/checkout/delivery-slots`, `/tg/checkout/payment-methods`
2. **P1 (High)** — `/products/filters`, `/search/suggestions`, `/tg/profile` + stats
3. **P2 (Medium)** — `/tg/orders` + status filter, `/tg/orders/{id}` + tracking.driver
4. **P3 (Low)** — `/home` + flash_sale, `/tg/addresses/{id}/primary`

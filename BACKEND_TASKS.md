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

## Yangi Endpointlar

| # | Endpoint | Method | Tavsif |
|---|----------|--------|--------|
| 1 | `/products/filters` | GET | Mavjud filtr opsiyalari (narx, brendlar, atributlar) |
| 2 | `/search/suggestions` | GET | Autocomplete qidiruv takliflari |
| 3 | `/tg/checkout/delivery-slots` | GET | Mavjud yetkazish vaqtlari |
| 4 | `/tg/checkout/payment-methods` | GET | Mavjud to'lov usullari |
| 5 | `/tg/addresses/{id}/primary` | PUT | Asosiy manzilni belgilash |

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

---

## Priority (Muhimlik tartibi)

1. **P0 (Blocker)** — `/init` + delivery_info, `/tg/checkout/delivery-slots`, `/tg/checkout/payment-methods`
2. **P1 (High)** — `/products/filters`, `/search/suggestions`, `/tg/profile` + stats
3. **P2 (Medium)** — `/tg/orders` + status filter, `/tg/orders/{id}` + tracking.driver
4. **P3 (Low)** — `/home` + flash_sale, `/tg/addresses/{id}/primary`

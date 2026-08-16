# StoreX — Tuzatish va Redizayn Rejasi

**Sana:** 2026-08-09 · **Holat:** 1–4-bosqichlar bajarildi, PR ochildi, deploy qilinmadi

---

## Bajarilish holati (2026-08-16)

| Bosqich | Holat | Branch |
|---|---|---|
| 1 — Qon to'xtatish | ✅ Bajarildi | `fix/phase-1-broken-funnel` (frontend) |
| 2 — Backend yaxlitligi | ✅ Bajarildi | `fix/storefront-integrity` (backend) |
| 3 — Pul aniqligi | ✅ Bajarildi | frontend branchida |
| 4 — Dizayn tizimi | ✅ Bajarildi (ko'z bilan tekshirilmagan) | frontend branchida |
| 5 — Redizayn | 🔸 5 ekrandan 1 tasi (Home) | frontend branchida |

**Tekshiruv:** frontend `lint` + `build` toza · backend `php artisan test` → **618 test o'tdi, 2107 assertion** (bitta jarayonda, ketma-ket; parallel ishga tushirish bitta test bazasini bo'lishgani uchun qarama-qarshi natija beradi) · **brauzerda uchta QA to'lqini**: 360×640 da to'liq sotib olish yo'li, keyin 1440/1024/768/600/480 kengliklarida ustun tekshiruvi, yorug' va qorong'i temada. Ikkita buyurtma uchidan-uchiga yaratildi va checkout summasi buyurtma summasiga aynan teng chiqdi.

**PR ochildi, merge qilinmadi:** frontend [#3](https://github.com/Azizjon03/e_store_mini_apps/pull/3) · backend [#26](https://github.com/Azizjon03/e_store_back/pull/26). Backend avval merge qilinishi kerak — frontend tuzatishlarining bir qismi shu branch qo'shgan maydonlarni o'qiydi. `main` ga merge avtomatik prodakshnga chiqaradi.

### Yopilgan bandlar

Barcha P0 · P1-1..P1-6 · P2-1..P2-10 · P3-1, P3-2, P3-4, P3-6, P3-7 · R-1, R-2, R-3

### Qisman yopilgan — qaror talab qiladi

| Band | Nima qilindi | Nima ochiq |
|---|---|---|
| P3-3 | Token 24 soatdan 30 kunga uzaytirildi | Refresh mexanizmi qurilmadi — 30 kundan keyin baribir jimgina logout |
| P3-5 | `X-Company-Id` / `?company_id` orqali begona tenantga kirish 403 bilan yopildi | `trustProxies(at: '*')` tufayli `X-Forwarded-Host` hujumchi qo'lida — **o'sha bypass domen orqali ochiq**. Yo trusted proxy'ni nginx IP'siga toraytirish, yo tekshiruvni faqat shaxsiy endpointlarga qo'llash kerak |
| P3-8 | Savatga alohida Redis connection berildi — `cache:clear` endi tegmaydi | Savat hali ham faqat Redis'da, 7 kun TTL. Bazaga ko'chirish — alohida arxitektura qarori |

### Ish davomida topilgan yangi nuqsonlar

| Nuqson | Holat |
|---|---|
| Variantli mahsulotni PDP'dan sotib bo'lmasdi — UI mavjud bo'lmagan `type`/`value` maydonlariga qurilgan edi | ✅ Tuzatildi |
| `makeItemId` da `0` yolg'onligi — har mahsulotning birinchi varianti asosiy narxda hisoblanardi | ✅ Tuzatildi |
| `product.rating` o'lik — API `reviews_avg_rating` yuboradi | ✅ Tuzatildi |
| Home `withAggregates()` ni chetlab o'tardi — `in_stock` doim `true` | ✅ Tuzatildi |
| `POST /cart/promo` promo kodni hech qayerga yozmasdi | ✅ Tuzatildi |
| Yangi mijoz manzil yarata olmasdi — `lat`/`lng` majburiy, formada xarita yo'q. Manzilsiz checkout bloklangan | ✅ Tuzatildi |
| Kategoriya plitkalarining yuqori qatori bosilmasdi — ko'rinmas pull-to-refresh qatlami ustida turgan | ✅ Tuzatildi |
| Yopishqoq sarlavhalar yopishmasdi — `overflow-x: hidden` ajdodni aylantirish konteyneriga aylantiradi | ✅ Tuzatildi |
| Manzilni o'chirish brauzerda ishlamasdi — `showConfirm` fallback'i doim `false` | ✅ Tuzatildi |
| Promo-kod hech qachon qo'llanmasdi va xato xabari yolg'on edi | ✅ Tuzatildi |
| Narx maydonlari API'da satr (`"14990000.00"`) — JS'da `+` konkatenatsiyaga aylanadi | ✅ Tuzatildi |
| Noma'lum mahsulot slug'i 404 emas, 500 qaytarardi | ✅ Tuzatildi |
| Kompyuterda ilova butun ekranga cho'zilardi, Profile esa tor ustun edi | ✅ Tuzatildi (480px ustun) |
| ProductCard sevimlilar tugmasi 28px — 48px tap-target minimumidan past | ⏸ Dizayn qarori |
| Variant `id` — massiv indeksi, mahsulot tahrirlansa siljiydi | ⏸ Checkout `name` bo'yicha hal qilgani uchun narx xavfi yo'q |
| `ManagerAuthService` va admin `UserController` telefonni `AuthService` orqali o'tkazmaydi | ⏸ Ochiq |
| Admin JSON API `/{company}/products/{product}` — Laravel pozitsion bog'lash tufayli `$id` ga kompaniya id'si tushadi | ⏸ Storefront'ga tegmaydi, alohida ish |

### Hali qilinmagan

- **Haqiqiy Telegram klientida tekshirish** — QA oddiy brauzerda haydaldi, `--tg-theme-*` palitrasi qo'lda kiritilgan holda. Telegram WebView'ining o'z xatti-harakati (native back tugmasi, haptika, tema almashuvi) sinalmagan.
- **5-bosqich: qolgan 4 ekran redizayni** — ProductDetail → Cart → Checkout → Catalog.
- **`DESIGN_STANDARD.md` §6 ziddiyati** — standart 56px dumaloq kategoriya ikonkasini belgilaydi, kod fold ishidan keyin 44px squircle. Uchinchi qiymat kiritmaslik uchun ataylab tegilmadi.
- **Demo ma'lumotida mahsulot rasmlari umuman yo'q** — 33 tadan 0 tasi. Bu kod nuqsoni emas, lekin har qanday dizayn taklifi maketda haqiqatdan chiroyliroq ko'rinishiga sabab bo'ladi.

---

**Quyidagi bo'limlar rejaning asl matni — tarixiy yozuv sifatida saqlanmoqda.**

---

## Xulosa

Loyiha "ishlayapti" ko'rinadi, lekin **sotib olish yo'li bir necha joyda uzilgan**. Eng og'iri: mahsulot sahifasidagi "Savatga qo'shish" tugmasi har bir mahsulotda o'chirilgan holatda, chunki backend `in_stock` maydonini umuman yubormaydi. Buyurtmalar ro'yxati esa `shipped` statusli buyurtma kelganda TypeError bilan qulaydi.

Ikkinchi muhim xulosa: **`BACKEND_TASKS.md` ~85% eskirgan**. Undagi deyarli hamma narsa allaqachon backend'da qilingan (`/init` maydonlari, `flash_sale`, `/products/filters`, `delivery-slots`, `payment-methods`, profil statistikasi, tracking, driver). Ya'ni asosiy ish backend'da yangi feature yozish emas — **mavjud backend bilan frontendni to'g'ri ulash**.

Uchinchisi: **narx yaxlitligi teshigi bor**. `unit_price` klientdan keladi va buyurtma o'sha narx bo'yicha yaratiladi.

Eng muhim 5 ta:

| # | Muammo | Ta'sir |
|---|---|---|
| P0-1 | `in_stock` yuborilmaydi → PDP'da savatga qo'shib bo'lmaydi | Funnel'ning asosiy kirish nuqtasi yopiq |
| P0-2 | Status enum mos emas → Orders sahifasi qulaydi | Qaytgan mijoz akkauntini ocholmaydi |
| P0-3 | Variantli mahsulot checkout'da 404 | Variantli tovarlar sotilmaydi |
| P0-5 | `unit_price` klientdan → 1 so'mlik buyurtma yaratish mumkin | Moliyaviy xavf |
| P1-1 | Ko'rsatilgan jami ≠ olinadigan summa | Ishonch yo'qoladi, nizolar |

---

## Bu reja qanday tuzildi

Beshta parallel audit:

1. **Lazyweb tadqiqoti — browse bosqichi** (12 real ilova ekrani ko'rildi) → [Agentic Search](https://labs.lazyweb.com/agentic-search/dba24944-d558-42f9-949c-00c1c45e3279)
2. **Lazyweb tadqiqoti — buy bosqichi** (13 ekran) → [Agentic Search](https://labs.lazyweb.com/agentic-search/cc8ec388-5771-4311-bd36-abe214e21f78)
3. **Kod auditi** — Home / Catalog / Search
4. **Kod auditi** — ProductDetail / Cart / Checkout / Profile / Orders
5. **Backend auditi** — `e_store_back` real route'lari, resource'lari va migratsiyalari

Har bir band `fayl:qator` dalili bilan tasdiqlangan. Faqat statik o'qish qilindi — runtime tekshiruvi talab qiladigan bandlar §9 da alohida belgilangan.

---

## P0 — Sotib olish yo'li buzilgan

Bular ishlab turgan do'konda pul yo'qotayotgan bandlar. Boshqa hech narsadan oldin.

### P0-1 · `in_stock` hech qachon yuborilmaydi → PDP'da savatga qo'shib bo'lmaydi
**Dalil:** `ProductDetail.tsx:501` → `disabled={!product.in_stock || ...}`, `:504` → "Hozirda mavjud emas". `ProductResource.php:12-44` — `in_stock` ham, `stock_quantity` ham chiqarilmaydi. `undefined` → `!undefined === true` → tugma har doim o'chiq.
**Tuzatish (2 bosqich):**
- *Bugun, frontend, 1 qator:* `product.in_stock === false` deb tekshirilsin (`undefined` = mavjud deb qabul qilinsin)
- *To'g'ri yechim, backend:* `ProductResource` ga `in_stock` va `stock_quantity` qo'shilsin
**Tomon:** Front (S) + Back (S)

### P0-2 · Buyurtma statuslari mos emas → Orders sahifasi qulaydi
**Dalil:** Backend enum `OrderStatus.php:7-13` = `pending, confirmed, processing, shipped, delivered, cancelled, refunded`. Frontend `types.ts:123-130` = `... delivering ... returned`. `Orders.tsx:98,114` da `STATUS_CONFIG[order.status]` → `undefined`, keyingi qator `status.color` → **TypeError, butun ro'yxat ErrorBoundary'ga tushadi**.
Yon ta'sirlari: "Yo'lda" filtri jimgina e'tiborsiz qoldiriladi; tracking timeline'da hech bir qadam yashil bo'lmaydi (`OrderDetail.tsx:22,62,100`); **kuryer ma'lumoti hech qachon ko'rinmaydi** — backend uni yuboradi (`buildTracking:110-116`), lekin UI `status === 'delivering'` shartiga bog'langan (`OrderDetail.tsx:154`).
**Tuzatish:** faqat frontend — `delivering` → `shipped`, `returned` → `refunded` (types, ikkala `STATUS_CONFIG`, `STATUS_ORDER`, `FILTER_TABS`, kuryer sharti). O'zbekcha yorliqlar o'zgarmaydi.
**Tomon:** Front (S) · ~8 qator

### P0-3 · Variantli mahsulot checkout'da 404 qaytaradi
**Dalil:** `StockService::reserveForOrder:258-272` `variant_name` satrini (`"Qora"`) `variant_id` sifatida uzatadi → `where('variant_id', ...)->firstOrFail()` (`:78-82`) → `ModelNotFoundException` → 404, tranzaksiya rollback. Admin yaratgan stock qatorlarida `variant_id = NULL`.
Diqqat: agar kompaniyada default ombor bo'lmasa, `StockService:261-265` stock nazoratini butunlay o'tkazib yuboradi — ya'ni bug ba'zi kompaniyalarda ko'rinmaydi.
**Tuzatish:** backend — cart va order item'larda `variant_name` o'rniga `variant_id` saqlansin. `STABILIZATION_PLAN.md:95-99` (§2.4) da bu allaqachon qayd etilgan, lekin "ma'lumot yaxlitligi" sifatida — uni **P0 konversiya bug'i** deb qayta belgilash kerak.
**Tomon:** Back (M)

### P0-4 · `sort=rating` → 500
**Dalil:** `ProductRepository.php:19` `reviews_avg_rating` ustuni bo'yicha saralaydi, `:88`. Bu ustun `products` jadvalida yo'q (migratsiyalar bo'yicha tekshirildi). Katalogda bu variant foydalanuvchiga ko'rsatiladi (`Catalog.tsx:22` — "Reyting").
Yonida: `ProductRepository.php:84-88` da `sort` uchun **whitelist yo'q** — istalgan `?sort=xxx` 500 beradi.
**Tuzatish:** backend — `sort` uchun whitelist; `rating` variantini `withAvg` bilan to'g'ri qilish yoki UI'dan olib tashlash.
**Tomon:** Back (S) + Front (S)

### P0-5 · Narx klientdan keladi va o'sha narx bo'yicha hisoblanadi
**Dalil:** `StoreCartItemRequest.php:20` `unit_price` ni `numeric|min:0` deb qabul qiladi, `CartService.php:32` uni o'zgarishsiz saqlaydi, `CreateOrderAction.php:127-129` o'sha narxni yig'adi. Mahsulot jadvali umuman so'ralmaydi. `name` va `thumbnail` ham klientdan kelib, o'zgarmas buyurtma snapshot'iga yoziladi.
Natija: `POST /cart/add {"product_id":5,"unit_price":1}` → `POST /checkout` → qonuniy 1 so'mlik buyurtma.
Bu `STABILIZATION_PLAN.md:23-31` (§1.1) da bor va u yerda aniq yechim ham yozilgan (`:261-264`).
**Tuzatish:** backend — `unit_price`/`name`/`thumbnail` requestdan olib tashlansin, narx serverda o'qilsin.
**Tomon:** Back (M) · **Frontend'ning checkout sinxronizatsiyasi shu teshikni har safar ishlatadi (P1-2), shuning uchun ikkalasi birga tuzatilishi kerak.**

### P0-6 · Buyurtma qatorlari `/product/null` ga olib boradi
**Dalil:** `Checkout.tsx:102` `slug` yuboradi, lekin `StoreCartItemRequest` uni ruxsat etmaydi va `CartService::add:28-35` saqlamaydi → `product_snapshot.slug` doim `null` → `OrderDetail.tsx:220` o'lik marshrutga navigatsiya qiladi.
**Tuzatish:** backend 2 qator (`slug` ni request qoidasiga va `CartService::add` ga qo'shish). Frontend'da vaqtinchalik: `slug` bo'sh bo'lsa `onClick` bloklansin.
**Tomon:** Back (S) + Front (S)

### P0-7 · Savat ↔ server rassinxroni: `getCart` javob shakli noto'g'ri
**Dalil:** Backend `CartController.php:40-47` **yassi** obyekt qaytaradi: `{data: [...items], total_price, delivery_cost, free_delivery_remaining, estimated_delivery, count}`. Frontend `storefront.ts:66-67` `r.data.data` oladi → natija **massiv**, `Cart` tipi emas.
Natija: `Cart.tsx:250-288` dagi **bepul yetkazish progress banneri va yetkazish vaqti kartasi hech qachon render bo'lmagan** — backend ularni hisoblab yuboradi, frontend o'qiy olmaydi.
Qo'shimcha: `getCart` `enabled: items.length > 0 && isAuthenticated` (`Cart.tsx:30`) — ya'ni faqat lokal savat to'la bo'lganda so'raladi, aynan server savati bo'sh bo'lgan paytda.
**Tuzatish:** frontend — `getCart` javobini to'g'ri o'qish; yoki backend javobni `{data: {...}}` ichiga o'rash. Frontend tomonini tanlash arzonroq.
**Tomon:** Front (S)

---

## P1 — Pul va ishonch

### P1-1 · Ko'rsatilgan jami ≠ olinadigan summa
**Dalil:** Klient jami = `subtotal − lokalChegirma + 0`. Yetkazish narxi `Checkout.tsx:80-85` da **qattiq 0** ("Delivery cost is not configured yet" izohi bilan), `cartStore.ts:34` default 0 va `partialize:86-90` uni saqlamaydi ham. Server jami = `subtotal − serverChegirma + serverYetkazish` (`CreateOrderAction.php:48`, `CheckoutController::deliveryFee:146-161`).
Ya'ni `delivery_info.delivery_cost > 0` bo'lgan har qanday do'konda **har bir buyurtma kam ko'rsatiladi**.
Promo ham xato: `applyPromoCode` `order_amount`siz chaqiriladi (`Cart.tsx:37`), server bo'sh savat summasi (0) bo'yicha hisoblaydi (`CartController.php:113-115`), natija lokal state'ga "haqiqat" sifatida yoziladi.
**Tuzatish:**
- *Arzon:* `GET /init` dan kelayotgan `delivery_info` (allaqachon tiplangan, `appStore` da bor) asosida `deliveryCost` hisoblansin — backend ishi shart emas
- *To'g'ri:* `POST /checkout/quote` — butun hisob-kitobni serverga ko'chirish (yangi backend bandi)
**Tomon:** Front (M) → keyin Back (M)

### P1-2 · Checkout sinxronizatsiya siklida rollback ham, idempotentlik ham yo'q
**Dalil:** `Checkout.tsx:88-113`.
- `await clearCart().catch(() => {})` (`:93`) — **xato yutiladi**. `CartService::add:24-26` mavjud qatorni *oshiradi* (almashtirmaydi), shuning uchun clear muvaffaqiyatsiz bo'lsa har bir miqdor **ikkilanadi** va foydalanuvchi shu bo'yicha pul to'laydi. Jimgina.
- Sikl o'rtasida xato bo'lsa (`:94-104`) rollback yo'q — server savatida qisman ma'lumot 7 kun qoladi va keyingi checkout'ni zaharlaydi
- N ta element = N ta ketma-ket so'rov, har biri 10s timeout (`client.ts:6`). Telegram WebView'ni fonga o'tkazsa — qisman savat, buyurtma yo'q
- `clear()` faqat `onSuccess` da (`:117`) — javob yo'qolsa, qayta urinish **ikkinchi buyurtma** yaratadi (idempotency key yo'q)
**Tuzatish:**
- *Faqat frontend:* `Promise.all`, `clearCart` xatosini yutmaslik, `catch` da server savatini tozalash
- *To'g'ri:* `POST /checkout` to'g'ridan-to'g'ri `items[]` qabul qilsin va server savati tushunchasi bu klient uchun olib tashlansin
**Tomon:** Front (M) → Back (M) · **Hech qaysi backend hujjatida yo'q — yangi band**

### P1-3 · `delivery_slot_id` jimgina tashlab yuboriladi
**Dalil:** `CheckoutRequest.php:16-28` da `delivery_slot_id` qoidasi **yo'q**, shuning uchun `validated()` uni olib tashlaydi (`CheckoutController.php:102`). Foydalanuvchi tanlagan yetkazish vaqti hech qayerga yozilmaydi.
Bundan tashqari slot ID'lari **pozitsion va har so'rovda qayta generatsiya qilinadi** (`CheckoutController:40,56`) — id 1 turli vaqtda turli oynani bildiradi.
**Tuzatish:** backend — `delivery_slot_id` va `pickup_point_id` validatsiyaga qo'shilsin, order'da ustun bo'lsin, slot ID'lari barqaror qilinsin.
**Tomon:** Back (M)

### P1-4 · "Qayta buyurtma" foydalanuvchiga yolg'on aytadi
**Dalil:** `reorderProducts` server savatini to'ldiradi (`StorefrontOrderController::reorder:165+`), toast "Mahsulotlar savatga qo'shildi" deydi va `/cart` ga o'tadi (`Orders.tsx:44-51`) — u yerda **lokal savat** ko'rsatiladi, ya'ni o'zgarmagan. Keyingi checkout'da esa `clearCart()` o'sha qo'shilganlarni o'chirib yuboradi.
**Tuzatish:** frontend — `order.items` dan lokal `cartStore.addItem` chaqirilsin, server round-trip'siz. Bugun ishlaydi.
**Tomon:** Front (S)

### P1-5 · Pickup point'lar UI'da umuman yo'q
**Dalil:** `PickupPoint` tipi bor (`types.ts:235-242`), `StoreConfig.pickup_points` bor, `checkout()` `pickup_point_id` qabul qiladi — lekin `src/` da `pickup_points` hech qayerda o'qilmaydi. "O'zi olib ketish" tanlansa faqat manzil bosqichi o'tkazib yuboriladi, qayerdan olish yozilmaydi.
**Tuzatish:** Front (M) + Back (S — `CheckoutRequest` ga qoida)

### P1-6 · Orders 20 ta bilan cheklangan
**Dalil:** `Orders.tsx:40` `getOrders(1, ...)` — sahifa qattiq 1, `meta` o'qilmaydi (`:57`). Server 20 tadan sahifalaydi.
**Tuzatish:** `useInfiniteQuery` (naqsh `useInfiniteProducts.ts` da tayyor).
**Tomon:** Front (S)

---

## P2 — UX va dizayn

### P2-1 · Dark mode: kartalar ko'rinmay qoladi
`storex-card` / `storex-surface` foni = `--tg-theme-bg-color` (sahifa foni bilan bir xil), ajratuvchisi = `rgba(0,0,0,0.06)`. Qorong'i fonda **har bir mahsulot kartasi, checkout bo'limi va buyurtma kartasi chegarasini yo'qotadi**. Barcha `--storex-border` ajratgichlari ham shunday.
Qo'shimcha: `ProductDetail.tsx:147,158` dagi `rgba(255,255,255,0.9)` tugmalar ichida `--tg-theme-text-color` ikonka bor → qorong'ida **oq ustida oq**.
**Tuzatish:** ajratish uchun chegara emas, tonal farq (`--tg-theme-secondary-bg-color`) ishlatilsin. Front (M)

### P2-2 · Profile qorong'i rejimda umuman ishlamaydi
`Profile.tsx` 100% `--stitch-*` tokenlarida, ular `global.css:68-80` da **qattiq hex** va Telegram temasiga bog'lanmagan. Telegram qorong'iga o'tganda butun ilova qorayadi, Profile oq varaq bo'lib qoladi. Ustiga `Profile.tsx:235-238` da uchta inline `rgba()` va `:379,383` da `bg-white`/`#d1d5db`.
**Tuzatish (eng arzoni):** `global.css` dagi `--stitch-*` bloki `--tg-theme-*` orqali qayta ta'riflansin — **~10 qator, bitta fayl, sahifa tegilmaydi**, va shu bilan ikkita token tizimi bittaga birlashadi.
**Tomon:** Front (S) · Yuqori qaytim

### P2-3 · Qidiruvda faqat 1-sahifa
`Search.tsx:38` `page` uzatmaydi, lekin UI `meta.total` ni chop etadi (`:276`). 240 ta natija deb yozilib, 20 tasi ko'rsatiladi. Front (S)

### P2-4 · Filtrlarning yarmi ishlamaydi
- `brands` va `rating` frontend'da yuboriladi, **`ProductRepository.list` ularni bilmaydi** — jimgina e'tiborsiz
- `attributes` (Rang, Xotira) `/products/filters` dan olinadi, UI'da ko'rsatilmaydi va `ProductFilters` tipida yuborish parametri **umuman yo'q**
- kategoriya sanoqlari olinadi va tashlab yuboriladi
- `applied_filters_count` server yuboradi, klient o'zi sanaydi
**Tuzatish:** Back (M — `brands`/`rating`/`attributes` filtrlarini qo'shish) + Front (M — UI)

### P2-5 · `/search/popular` — bo'sh stub
`StorefrontSearchController.php:62-68` qattiq bo'sh massiv ("Placeholder" izohi bilan). Qidiruv sahifasidagi "Mashxur qidiruvlar" bloki doim bo'sh.
**Tuzatish:** eng arzoni — qo'lda tanlangan 6-8 ta so'rov (Apple Store naqshi: bu analitika emas, merchandising qarori). Back (S)

### P2-6 · Bannerlarni bosish ishlamaydi
`BannerResource.php:12-35` `link_url`, `placement`, `type` yuboradi. Frontend `link_type`/`link_value` kutadi (`HeroBanner.tsx:43-46`) → **ikkala tarmoq ham o'lik**. Placement nomlari ham farq qiladi: backend `home_top`/`home_middle`, frontend `home_hero`/`home_mid`.
**Tuzatish:** Front (S) — `link_url` ga o'tish, placement nomlarini moslash.

### P2-7 · Vizual drift
| Nima | Holat |
|---|---|
| Bo'sh holat | 3 xil ko'rinish (`EmptyState` 20px / Search 17px / Home 16px) |
| Skeleton | 3 xil implementatsiya; Home'niki real layout'ga mos emas (160px vs 140px banner) → har yuklanishda sakrash |
| `ProductGrid` | 3 ta ekrandan faqat 1 tasida ishlatiladi, qolgani inline nusxa |
| Quantity stepper | 2 marta qo'lda yozilgan, biri 28px — **48px tap-target minimumidan past** |
| Radio qator | faqat Checkout ichida 3 marta takrorlangan |
| Ikonka | Profile — Material Symbols, qolgani — qo'lda SVG |
| Chip | `.storex-chip.active` klassi bor, lekin Catalog va Search har biri o'z inline override'ini yozgan |
**Tuzatish:** 4 ta kichik komponent ajratish (stepper, radio row, empty state, chip) + Home skeleton'ini haqiqiy layout'ga moslashtirish. Front (M)

### P2-8 · `Badge` tokeni xato → savat soni foni yo'q
`Badge.tsx:19-20` `--store-badge-bg` o'qiydi, `global.css:29-30` `--storex-badge-bg` ta'riflaydi. "Savatga qo'shildi" ni tasdiqlaydigan birinchi element fonsiz chiqadi. Front (S) · 2 qator

### P2-9 · Ishlash
- **FlashSale har sekundda butun gridni qayta render qiladi** (`Home.tsx:158`) — taymer alohida leaf komponentga chiqarilsin
- Katalogda narx maydoniga har harf bosilganda `/products` so'rovi (debounce yo'q) — Search'da 300ms debounce bor, naqsh tayyor
- Orders'da 20 buyurtma × 4 rasm = **80 ta siqilmagan rasm**, har biri 48×48 ko'rsatiladi
- HeroBanner ekrandan tashqarida ham doimiy 4s interval
Front (M)

### P2-10 · Matn xatolari
- `"Mashxur qidiruvlar"` → **`"Mashhur"`** (`Search.tsx:214`)
- Orders bo'sh holati `icon="---"` — uchta chiziq render bo'ladi (`Orders.tsx:90`)
- Bitta ekranda uchta imlo: "filter" / "Filtrlarni" / "Filtr" (`Catalog.tsx:193,195,260`)
- `CategoryChips` da "Boshqa", standartda "Yana" (`DESIGN_STANDARD.md:77`)
- Profile stat yorliqlari 96px katakda 10px uppercase + tracking — `"BUYURTMALAR"` ≈ 77px kontentga 64px joy: **to'g'rilanadi yoki o'raladi**
Front (S)

---

## P3 — Infratuzilma va xavfsizlik

| # | Muammo | Dalil | Tomon |
|---|---|---|---|
| P3-1 | **Rate limiting deyarli yo'q.** `POST /auth/register` da umuman yo'q; `/search`, `/products` da yo'q va ular indekssiz seq scan — arzon DoS | `bootstrap/app.php:27-30` | Back (S) |
| P3-2 | **Qidiruv indekslanmagan** — `name->>'uz' ILIKE '%q%'`, GIN/trigram indeks yo'q. Meilisearch docker'da bor, kodda ishlatilmaydi | `ProductRepository.php:60-66` | Back (M) |
| P3-3 | **Sanctum token 24 soat** (`SANCTUM_TOKEN_EXPIRATION=1440`) — har kuni jimgina logout, refresh mexanizmi yo'q. Mini App uchun og'riqli | `config/sanctum.php:50` | Back (S) — qaror talab qiladi |
| P3-4 | **Telefon normalizatsiya qilinmaydi.** `998...` bilan ro'yxatdan o'tgan foydalanuvchi `+998...` bilan kira olmaydi; `unique` ham shu teshikka ega — bir odam ikki marta ro'yxatdan o'tishi mumkin | `AuthService.php:45` | Back (S) |
| P3-5 | **`X-Company-Id` header'iga ishoniladi** — istalgan klient boshqa kompaniya do'koniga murojaat qila oladi, jumladan `/cart`, `/checkout`, `/favorites` uchun | `DomainResolver.php:27-36` | Back — **qaror talab qiladi** |
| P3-6 | Storefront'da ichki maydonlar ochiq: `status`, `sort_order`, `seo`, `barcode`. (`cost_price` to'g'ri yopilgan) | `ProductResource.php:33-43` | Back (S) |
| P3-7 | `DELETE /cart/promo` — **hech narsa qilmaydigan no-op**, muvaffaqiyat qaytaradi | `CartController.php:139-145` | Back (S) |
| P3-8 | Savat faqat Redis'da, 7 kun TTL. `php artisan cache:clear` **hamma mijozning savatini o'chiradi** | `CartService.php:98-101` | Back — arxitektura qarori |

---

## Dizayn yo'nalishi

Lazyweb tadqiqotidan kelib chiqib, **ma'lumot talab qilmaydigan** naqshlar tanlandi — kichik do'kon uchun eng muhim mezon shu. Reyting, "154 ta sotilgan", "oxirgi 1 ta qoldi" kabi signallar bizda yo'q va soxta qilish ishonchni buzadi.

**Olinadigan naqshlar:**

| Naqsh | Manba | Nega bizga mos |
|---|---|---|
| 3 qatorli "Kafolatlar" kartasi (yetkazish va'dasi / to'lov usullari / qaytarish) | Alibaba | Faqat matn, hech qanday ma'lumot bog'liqligi yo'q. Naqd to'lov uchun eng kuchli ishonch vositasi |
| Har bir to'lovni nomlab ko'rsatuvchi jadval (`ⓘ` bilan) | DoorDash | Checkout'dan voz kechishning eng katta sababi — yashirin summa. Bizda P1-1 aynan shu |
| CTA ostida "hozir pul yechilmaydi" | StubHub | Naqd to'lov uchun bu tom ma'noda rost |
| Chegirmani **sababi bilan** alohida qator qilib ko'rsatish | GoPuff | Quruq "−25 000" o'zboshimchalik kabi o'qiladi |
| Filtr sheet'ida jonli "N ta natijani ko'rish" | Best Buy | Nol natija tupigini oldini oladi |
| Chipda qo'llanilgan filtr soni — `Filtr (2)` | eBay | "Joyimni yo'qotmayman" muammosini bepul hal qiladi |
| Qidiruvda so'rov + natija sonini takrorlash | Costco | Qidiruv ishonchi uchun eng arzon tuzatish |
| Dumaloq kategoriya thumbnail'lari | SHEIN, Temu | Mahsulot suratlari sifati bir xil bo'lmaganda katalogni tartibli ko'rsatadi |
| Checkout = hal qilingan qarorlarning 3 qatori, yashil belgi bilan | Farfetch | Eng kam tashvishli va eng arzon quriladigan checkout |
| Yetkazishni **savatda** tanlash | Best Buy | Butun bir checkout bosqichini olib tashlaydi |
| To'lov usullarini "Hozir to'lash" / "Yetkazishda to'lash" deb guruhlash | StubHub | Naqd + Payme + Click aynan shu ikki guruhga tushadi |

**Ataylab olinmaydigan:** AliExpress'ning beshta bir vaqtdagi chegirma signali (bitta kompaniyali do'konda ishonchsiz ko'rinadi), taymer va "oxirgi 1 ta" (real ma'lumot yo'q — yolg'on bo'ladi), tavsiya karuselllari (katalog kichik), Uber Eats'ning xarita/pin'i (Telegram WebView'da mo'rt va operatsion imkoniyat yo'q).

**Ikki halol bo'shliq:** Lazyweb korpusida (a) **naqd to'lov ko'rsatilgan birorta ekran** va (b) **ko'p-atributli variant tanlash** (rang × xotira) namunasi topilmadi. Bu ikki joyda naqshdan emas, mantiqdan kelib chiqib loyihalash kerak.

**Muhim:** ProductDetail'da hozir ko'p-atributli variant **buzilgan** — `Object.values(selectedVariants)[0]` (`:52,69`) faqat birinchi o'lchamni oladi, lekin narx yorlig'i **barcha** tanlangan variantlarning `extra_price` ini qo'shadi (`:58-60`). Ya'ni ko'rsatilgan narx va savatga tushgan narx bir xil bosishda farq qilishi mumkin.

---

## Bajarish tartibi

**Bosqich 1 — Qon to'xtatish (1-2 kun, asosan frontend)**
P0-1 (front qismi), P0-2, P0-6 (front), P0-7, P1-4, P2-8, P2-10.
Hammasi klient tomonida, backend kutilmaydi. Shundan keyin funnel yopiq emas va Orders qulamaydi.

**Bosqich 2 — Backend yaxlitligi (3-5 kun)**
P0-3 (variant), P0-5 (narx), P0-4 (sort), P0-1 (backend qismi), P0-6 (backend), P1-3 (slot).
`STABILIZATION_PLAN.md` §1.1 va §2.4 shu yerda — takrorlamang, kengaytiring.

**Bosqich 3 — Pul aniqligi (2-3 kun)**
P1-1 (yetkazish narxi + promo), P1-2 (sinxronizatsiya), P1-6, P2-3.
Shundan keyin ko'rsatilgan summa = olinadigan summa.

**Bosqich 4 — Dizayn tizimi (3-4 kun)**
P2-2 (stitch→tg tokenlar — eng yuqori qaytimli bitta o'zgarish), P2-1 (dark mode), P2-7 (komponentlar), P2-9 (ishlash).

**Bosqich 5 — Redizayn**
Bu yerda `/ui-designer` skilli ekranma-ekran ishlaydi: har bir ekran uchun 3 ta konsepsiya → verifikatsiya → tavsiya. Tartib: Home → ProductDetail → Cart → Checkout → Catalog.
**Bosqich 1-4 dan oldin boshlamang** — buzilgan funnel ustiga chiroyli dizayn qo'yish behuda.

**Parallel, istalgan vaqtda:** P3-1, P3-4, P3-6, P3-7 (kichik, mustaqil).
**Alohida qaror talab qiladi:** P3-3 (token muddati), P3-5 (`X-Company-Id`), P3-8 (savat Redis'da).

---

## Runtime tekshiruvi — BAJARILDI (2026-08-09)

Lokal Docker stack'da (`localhost:8085`, kompaniya 1 = TechMart, seed ma'lumot) tekshirildi. **Prodakshnga tegilmadi.** Yaratilgan test foydalanuvchi va buyurtma tekshiruvdan keyin o'chirildi.

> Tekshiruv boshlanishida butun stack 500 qaytardi: Redis AOF fayli buzilgan edi (`Bad file format reading the append only file`) va crash loop'da turgan. `redis-check-aof --fix` bilan tuzatildi (704 bayt kesildi, zaxira nusxa qoldirildi). **Bu P3-8 ni tasdiqlaydi: savat Redis'da yashagani uchun Redis yiqilsa butun do'kon yiqiladi.**

### Tasdiqlandi ✅

| Band | Natija |
|---|---|
| **P0-1** | `/products` javobida `in_stock`, `stock_quantity`, `rating`, `reviews_count`, `old_price` — **hech biri yo'q**. Faqat `compare_price` va `discount_percentage` bor |
| **P0-3** | Variantli mahsulot checkout'i → **HTTP 404 `{"message":"Resource not found"}`** |
| **P0-4** | `sort=rating` → **500**, log: `column "reviews_avg_rating" does not exist`. `sort=garbage` → **500**, log: `column "garbage" does not exist` — ya'ni **foydalanuvchi kiritgan matn to'g'ridan-to'g'ri `orderBy` ga tushadi**. `sort=price_asc` → 200 |
| **P0-5** | 14 990 000 so'mlik telefon **1 so'mga** buyurtma qilindi — `POST /cart/add {"unit_price":1,"name":"HACKED iPhone"}` → `POST /checkout` → **HTTP 201**, `total_price: 1`. Mahsulot nomi ham o'zgarmas buyurtma snapshot'iga **hujumchi bergan matn** bilan yozildi |
| **P0-6** | Buyurtma qatorida `"slug": null` — tasdiqlandi |
| **P0-7** | `/cart` javobi **yassi**: `total_price`, `free_delivery_remaining`, `estimated_delivery` yuqori darajada. `estimated_delivery` = qattiq `"Bugun, 2-3 soat ichida"` |
| **P2-5** | `/search/popular` → `{"data":[]}` |
| **P3-5** | Kompaniya 1 foydalanuvchisining tokeni bilan `X-Company-Id: 2` yuborilganda **savatga qo'shish 200**, `/orders` **200** — tenant izolyatsiyasi header orqali chetlab o'tiladi |
| — | Mavjud bo'lmagan `product_id` bilan checkout → **500**, FK violation. Lokal `APP_DEBUG=true` bo'lgani uchun **SQL xato matni klientga qaytdi** — prodda tekshirish kerak |

### To'g'rilandi ❌ — rejadagi bashorat noto'g'ri edi

**`delivery-slots` `working_hours: null` bo'lganda 500 bermaydi.** Audit `explode('-', null)` 500 beradi deb bashorat qilgan edi; amalda kod default `09:00-21:00` ga qaytadi va **HTTP 200** beradi. Bu band rejadan olib tashlandi.

### Yangi topilmalar 🆕

| # | Topilma | Ta'sir |
|---|---|---|
| **R-1** | **Barcha yetkazish oynalari `available: false`** qaytadi | Foydalanuvchi UI'da oynalarni ko'radi, lekin **birortasini tanlay olmaydi**. P1-3 (slot validatordan tushib qolishi) bilan qo'shilib, yetkazish vaqti butunlay ishlamaydi |
| **R-2** | **`/checkout/payment-methods` → `{"methods":[]}`** (kompaniya 1 da yoqilgan provayder yo'q) | Checkout'da **to'lov usullari ro'yxati bo'sh**. `Checkout.tsx:32` esa default `'click'` qo'yadi — ro'yxatda yo'q usul tanlangan holda submit ochiq qoladi. Bu audit bashorat qilgan stsenariy, endi tasdiqlangan holat |
| **R-3** | **Variant shakli mos emas.** API `{sku, name, price}` qaytaradi, frontend `{id, type, value, extra_price}` kutadi | `variant.id` → `undefined` → `makeItemId` **bitta mahsulotning barcha variantlarini bitta savat qatoriga qo'shib yuboradi**. `extra_price` yo'q, shuning uchun variantga qarab narx hech qachon o'zgarmaydi. Bu P0-3 dan alohida, sof frontend muammosi |
| **R-4** | `delivery_info` = butunlay nol, `pickup_points` = bo'sh, `working_hours` = null | P1-1 ning **hozirgi ko'rinadigan ta'siri nol** — chunki yetkazish narxi haqiqatan 0. Mexanizm buzuq bo'lib qolaveradi: kompaniya narx qo'ygan kunda buyurtmalar kam ko'rsatila boshlaydi. Prioritet o'zgarmaydi, lekin shoshilinchlik pastroq |

### Hali tekshirilmagan

- Deploy qilingan `.env` dagi `SANCTUM_TOKEN_EXPIRATION` va `APP_DEBUG` — serverga kirish talab qiladi
- Prodakshn kompaniyasida `delivery_info` / `working_hours` to'ldirilganmi — R-4 ning ta'siri shunga bog'liq

---

## Hujjatlarni tozalash

- **`BACKEND_TASKS.md` ~85% eskirgan** — §1, §2, §3, §7, §8, §10 va "Yangi Endpointlar" jadvalining barcha 5 bandi allaqachon bajarilgan. Uni yangilash yoki arxivga olish kerak, aks holda keyingi ishlab chiquvchi qilingan ishni qaytadan qiladi.
- Undagi barcha yo'llar `/tg/` prefiksi bilan yozilgan. Backend'da **ikkala** oila ro'yxatdan o'tgan (`routes/api.php:117-152` — Telegram initData; `:199-234` — Sanctum). Bu SPA **prefikssiz Sanctum guruhini** ishlatadi. Hujjatga izoh qo'shilsin.
- `/tg/` blokini o'chirishdan oldin uni boshqa klient (bot, eski bundle) ishlatmayotganini tekshiring.

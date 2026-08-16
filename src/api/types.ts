// Telegram WebApp user payload (raw, from initDataUnsafe). Used for prefill only.
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

// Authenticated user returned by /storefront/auth/me (backend UserResource).
export interface AuthUser {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  avatar: string | null;
  telegram_id: string | null;
  status: string;
  two_factor_enabled: boolean;
  created_at: string;
}

export interface AuthResponse {
  data: AuthUser;
  token: string;
}

// Categories
export interface Category {
  id: number;
  name: LocalizedString;
  slug: string;
  icon?: string;
  image?: string;
  color?: string;
}

// Products
// A variant as the backend actually stores it: `{name, sku, price}` on the
// product's own JSON column, plus two fields ProductResource computes.
// There is no `type`/`value` pair — those were assumed by an earlier frontend
// draft and never existed in the data, which left the variant picker rendering
// blank labels and blocking add-to-cart on every variant product.
export interface ProductVariant {
  // The variant's 0-based index within its product's `variants` array.
  // Zero is a real id — never test this with truthiness (`variant.id ? …`),
  // or the first variant silently collapses onto the no-variant cart line.
  // Only stable while the product isn't re-edited; checkout resolves the
  // variant by `name` server-side, so a stale index can't mis-price an order.
  id: number;
  name: string;
  sku?: string;
  // The variant's absolute price — what checkout actually charges.
  price?: number;
  // `price - product.price`, computed by the backend and omitted when the
  // variant carries no price of its own.
  extra_price?: number;
  image?: string;
}

export type LocalizedString = string | Record<string, string>;

export interface Product {
  id: number;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString;
  sku?: string;
  category_id: number | string;
  brand_id?: number | string;
  price: number;
  old_price?: number;
  compare_price?: number;
  discount_percent?: number;
  discount_percentage?: number;
  has_discount?: boolean;
  currency?: string;
  image?: string;
  thumbnail?: string | null;
  images?: string[];
  reviews_avg_rating?: number;
  reviews_count?: number;
  in_stock?: boolean;
  stock_quantity?: number;
  variants?: ProductVariant[];
  attributes?: Record<string, string>;
}

export interface Review {
  id: number;
  user_name: string;
  user_photo?: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface ProductDetail extends Product {
  full_description: string;
  attributes: Record<string, string>;
  similar_products: Product[];
  reviews: Review[];
}

// Cart
// A cart line's `product` is either a full catalog Product (normal add-to-cart
// flow) or a lightweight OrderProductSnapshot (reorder flow, built from an
// order's own items — see OrderItem below). Only fields both shapes share
// (name/image/thumbnail/slug) may be relied on when rendering a CartItem.
export interface CartItem {
  id: string;
  product_id: number;
  product: Product | OrderProductSnapshot;
  quantity: number;
  variant?: ProductVariant;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total_price: number;
  discount?: number;
  promo_code?: string;
  delivery_cost: number;
  free_delivery_remaining?: number;
  estimated_delivery?: string;
}

export interface PromoCode {
  code: string;
  discount_percent: number;
  discount_amount: number;
  valid: boolean;
  message?: string;
}

// Orders
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// The backend attaches only a lightweight snapshot of the product to an order
// item, not a full Product — id/price/category_id are never present. `slug`
// is currently always sent as null (typed optional, since every existing
// consumer already treats a missing slug as "no link" via truthiness/`??`
// checks — null and undefined behave identically there), so any product
// link built from this must be guarded.
export interface OrderProductSnapshot {
  name: LocalizedString;
  image?: string;
  thumbnail?: string | null;
  slug?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product: OrderProductSnapshot;
  quantity: number;
  variant?: ProductVariant;
  price: number;
}

export interface Order {
  id: number;
  number: string;
  status: OrderStatus;
  items: OrderItem[];
  total_price: number;
  delivery_cost: number;
  discount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderTrackDriver {
  name: string;
  phone: string;
}

export interface OrderTrack {
  status: string;
  timestamp: string;
  description?: string;
  title?: string;
  completed?: boolean;
  location?: string;
  driver_phone?: string;
  driver?: OrderTrackDriver;
  estimated_delivery?: string;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  city: string;
  district: string;
  full_address: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  is_primary: boolean;
  created_at: string;
}

export interface OrderDetail extends Order {
  shipping_address: Address;
  delivery_method: 'delivery' | 'pickup';
  payment_method: 'click' | 'payme' | 'cash';
  payment_method_name?: string;
  payment_method_icon?: string;
  estimated_delivery?: string;
  notes?: string;
  tracking: OrderTrack[];
}

// Banners
export interface Banner {
  id: number;
  title: string;
  image: string;
  placement: 'home_hero' | 'home_mid' | 'product_detail';
  // `link_type`/`link_value` are declared by an older contract but the backend
  // never populates them (no matching columns exist) — every consumer must use
  // `link_url` instead. Kept here in case a future backend revival repopulates
  // them; nothing in the app currently reads them.
  link_type?: 'product' | 'category' | 'url' | 'none';
  link_value?: string;
  // Admin free-text: either an absolute URL or an internal app path. The
  // banner tap handler sniffs which and routes accordingly.
  link_url?: string;
}

// Home page
export interface HomeSection {
  type: 'sale' | 'new' | 'popular' | 'category';
  title: string;
  category_slug?: string;
  products: Product[];
  layout?: 'grid' | 'horizontal';
}

export interface FlashSale {
  title: string;
  ends_at: string;
  products: Product[];
}

export interface HomeData {
  banners: Banner[];
  banners_mid?: Banner[];
  categories: Category[];
  sections: HomeSection[];
  flash_sale?: FlashSale;
}

// Store Config
export interface DeliveryInfo {
  free_delivery_from: number;
  min_order_amount: number;
  delivery_cost: number;
}

export interface PickupPoint {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  working_hours: string;
}

export interface StoreConfig {
  company_id: number;
  company_name: string;
  logo: string;
  accent_color: string;
  primary_color: string;
  secondary_color?: string;
  theme: 'light' | 'dark';
  languages: string[];
  currency: string;
  currency_symbol?: string;
  phone: string;
  email: string;
  social_links?: Record<string, string>;
  delivery_info?: DeliveryInfo;
  working_hours?: string;
  pickup_points?: PickupPoint[];
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
    path: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Delivery slots
export interface DeliverySlot {
  /**
   * Self-describing composite id, e.g. "2026-08-10_09:00-11:00".
   * Deliberately a string, not a number: the old positional ids were
   * regenerated per request, so a stored id meant a different window the
   * next day. The date is encoded so a persisted slot stays unambiguous.
   */
  id: string;
  time: string;
  available: boolean;
}

export interface DeliverySlotResponse {
  today?: DeliverySlot[];
  tomorrow?: DeliverySlot[];
}

// Payment methods
export interface PaymentMethodOption {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

// Product filter options
export interface FilterOptions {
  price_range: { min: number; max: number };
  brands: Array<{ id: number; name: string; count: number }>;
  categories: Array<{ id: number; name: string; slug: string; count: number }>;
  attributes?: Array<{ name: string; values: string[] }>;
}

// Profile with stats
export interface ProfileStats {
  orders_count: number;
  favorites_count: number;
  addresses_count: number;
}

export interface Profile {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  stats?: ProfileStats;
}

// Filter params
export interface ProductFilters {
  page?: number;
  per_page?: number;
  category_slug?: string;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  min_price?: number;
  max_price?: number;
  // Brand ids. Numbers, not strings — the backend casts and drops anything
  // non-numeric rather than erroring, so a wrong type fails silently.
  brands?: number[];
  // Minimum average rating, 1–5. Products with no approved review never match.
  rating?: number;
  // Attribute name -> selected values, e.g. `{ Rang: ['Qora', 'Oq'] }`.
  // Values under one key are OR'd; separate keys are AND'd.
  attributes?: Record<string, string[]>;
  discount_only?: boolean;
  q?: string;
}

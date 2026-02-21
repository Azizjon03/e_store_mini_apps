// User & Auth
export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

// Categories
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

// Products
export interface ProductVariant {
  id: number;
  name: string;
  type: 'color' | 'size' | 'other';
  value: string;
  extra_price?: number;
  image?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category_id: number;
  price: number;
  old_price?: number;
  discount_percent?: number;
  image?: string;
  images?: string[];
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  stock_quantity: number;
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
export interface CartItem {
  id: string;
  product_id: number;
  product: Product;
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
  | 'delivering'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  id: number;
  product_id: number;
  product: Product;
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

export interface OrderTrack {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
  driver_phone?: string;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  city: string;
  district: string;
  full_address: string;
  landmark?: string;
  is_primary: boolean;
  created_at: string;
}

export interface OrderDetail extends Order {
  shipping_address: Address;
  delivery_method: 'delivery' | 'pickup';
  payment_method: 'click' | 'payme' | 'cash';
  notes?: string;
  tracking: OrderTrack[];
}

// Banners
export interface Banner {
  id: number;
  title: string;
  image: string;
  placement: 'home_hero' | 'home_mid' | 'product_detail';
  link_type: 'product' | 'category' | 'url' | 'none';
  link_value?: string;
}

// Home page
export interface HomeSection {
  type: 'sale' | 'new' | 'popular' | 'category';
  title: string;
  category_slug?: string;
  products: Product[];
}

export interface HomeData {
  banners: Banner[];
  banners_mid?: Banner[];
  categories: Category[];
  sections: HomeSection[];
}

// Store Config
export interface StoreConfig {
  company_id: number;
  company_name: string;
  logo: string;
  accent_color: string;
  primary_color: string;
  theme: 'light' | 'dark';
  languages: string[];
  currency: string;
  phone: string;
  email: string;
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
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Filter params
export interface ProductFilters {
  page?: number;
  per_page?: number;
  category_slug?: string;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  min_price?: number;
  max_price?: number;
  brands?: string[];
  rating?: number;
  discount_only?: boolean;
  q?: string;
}

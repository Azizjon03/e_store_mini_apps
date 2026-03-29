import apiClient from './client';
import type {
  HomeData,
  Category,
  Product,
  ProductDetail,
  StoreConfig,
  Cart,
  PromoCode,
  Order,
  OrderDetail,
  Address,
  PaginatedResponse,
  ProductFilters,
  FilterOptions,
  DeliverySlotResponse,
  PaymentMethodOption,
  Profile,
} from './types';

// Init (public)
export const getStoreConfig = () =>
  apiClient.get<{ data: StoreConfig }>('/init').then((r) => r.data.data);

// Home (public)
export const getHomeData = () =>
  apiClient.get<{ data: HomeData }>('/home').then((r) => r.data.data);

// Categories (public)
export const getCategories = () =>
  apiClient.get<{ data: Category[] }>('/categories').then((r) => r.data.data);

// Products (public)
export const getProducts = (params: ProductFilters) =>
  apiClient
    .get<PaginatedResponse<Product>>('/products', { params })
    .then((r) => r.data);

export const getProductDetail = (slug: string) =>
  apiClient
    .get<{ data: ProductDetail }>(`/products/${slug}`)
    .then((r) => r.data.data);

export const getProductFilters = (params?: { category_slug?: string }) =>
  apiClient
    .get<{ data: FilterOptions }>('/products/filters', { params })
    .then((r) => r.data.data);

// Search (public)
export const searchProducts = (query: string, page = 1) =>
  apiClient
    .get<PaginatedResponse<Product>>('/search', { params: { q: query, page } })
    .then((r) => r.data);

export const getPopularSearches = () =>
  apiClient
    .get<{ data: string[] }>('/search/popular')
    .then((r) => r.data.data);

export const getSearchSuggestions = (query: string) =>
  apiClient
    .get<{ data: { suggestions: string[] } }>('/search/suggestions', { params: { q: query } })
    .then((r) => r.data.data.suggestions);

// Cart (authenticated — tg/ prefix)
export const getCart = () =>
  apiClient.get<{ data: Cart }>('/tg/cart').then((r) => r.data.data);

export const addToCart = (data: {
  product_id: string;
  quantity: number;
  variant_name?: string;
  unit_price: number;
  name: string;
  thumbnail?: string;
  slug?: string;
}) => apiClient.post('/tg/cart/add', data).then((r) => r.data);

export const updateCartItem = (data: {
  product_id: string;
  quantity: number;
  variant_name?: string;
}) => apiClient.put('/tg/cart/update', data).then((r) => r.data);

export const removeCartItem = (data: {
  product_id: string;
  variant_name?: string;
}) => apiClient.delete('/tg/cart/remove', { data }).then((r) => r.data);

export const applyPromoCode = (code: string, order_amount?: number) =>
  apiClient
    .post<{ data: { promo: PromoCode } }>('/tg/cart/promo', { code, order_amount })
    .then((r) => r.data.data);

export const removePromoCode = () =>
  apiClient.delete('/tg/cart/promo').then((r) => r.data);

// Checkout (authenticated — tg/ prefix)
export const getDeliverySlots = () =>
  apiClient
    .get<{ data: DeliverySlotResponse }>('/tg/checkout/delivery-slots')
    .then((r) => r.data.data);

export const getPaymentMethods = () =>
  apiClient
    .get<{ data: { methods: PaymentMethodOption[] } }>('/tg/checkout/payment-methods')
    .then((r) => r.data.data.methods);

export const checkout = (data: {
  address_id?: number;
  shipping_address?: { full_address: string; lat?: number; lng?: number };
  delivery_method: 'delivery' | 'pickup';
  payment_method: string;
  delivery_slot_id?: number;
  pickup_point_id?: number;
  notes?: string;
  promo_code?: string;
}) =>
  apiClient
    .post<{ data: { order: Order; payment_url?: string } }>('/tg/checkout', data)
    .then((r) => r.data.data);

// Orders (authenticated — tg/ prefix)
export const getOrders = (page = 1, status?: string) =>
  apiClient
    .get<PaginatedResponse<Order>>('/tg/orders', { params: { page, status: status !== 'all' ? status : undefined } })
    .then((r) => r.data);

export const getOrderDetail = (id: number) =>
  apiClient
    .get<{ data: OrderDetail }>(`/tg/orders/${id}`)
    .then((r) => r.data.data);

export const reorderProducts = (orderId: number) =>
  apiClient
    .post<{ data: Cart }>(`/tg/orders/${orderId}/reorder`)
    .then((r) => r.data.data);

// Profile (authenticated — tg/ prefix)
export const getProfile = () =>
  apiClient.get<{ data: Profile }>('/tg/profile').then((r) => r.data.data);

// Addresses (authenticated — tg/ prefix)
export const getAddresses = () =>
  apiClient.get<{ data: Address[] }>('/tg/addresses').then((r) => r.data.data);

export const createAddress = (
  data: Omit<Address, 'id' | 'user_id' | 'created_at'>,
) =>
  apiClient
    .post<{ data: Address }>('/tg/addresses', data)
    .then((r) => r.data.data);

export const updateAddress = (id: number, data: Partial<Address>) =>
  apiClient
    .put<{ data: Address }>(`/tg/addresses/${id}`, data)
    .then((r) => r.data.data);

export const deleteAddress = (id: number) =>
  apiClient.delete(`/tg/addresses/${id}`);

export const setPrimaryAddress = (id: number) =>
  apiClient.put<{ data: Address }>(`/tg/addresses/${id}/primary`).then((r) => r.data.data);

// Favorites (authenticated — tg/ prefix)
export const getFavorites = () =>
  apiClient.get<{ data: Product[] }>('/tg/favorites').then((r) => r.data.data);

export const addToFavorites = (productId: string) =>
  apiClient.post(`/tg/favorites/${productId}`);

export const removeFromFavorites = (productId: string) =>
  apiClient.delete(`/tg/favorites/${productId}`);

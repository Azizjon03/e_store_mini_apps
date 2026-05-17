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

// Cart (Sanctum auth)
export const getCart = () =>
  apiClient.get<{ data: Cart }>('/cart').then((r) => r.data.data);

export const addToCart = (data: {
  product_id: string;
  quantity: number;
  variant_name?: string;
  unit_price: number;
  name: string;
  thumbnail?: string;
  slug?: string;
}) => apiClient.post('/cart/add', data).then((r) => r.data);

export const updateCartItem = (data: {
  product_id: string;
  quantity: number;
  variant_name?: string;
}) => apiClient.put('/cart/update', data).then((r) => r.data);

export const removeCartItem = (data: {
  product_id: string;
  variant_name?: string;
}) => apiClient.delete('/cart/remove', { data }).then((r) => r.data);

export const applyPromoCode = (code: string, order_amount?: number) =>
  apiClient
    .post<{ data: { promo: PromoCode } }>('/cart/promo', { code, order_amount })
    .then((r) => r.data.data);

export const removePromoCode = () =>
  apiClient.delete('/cart/promo').then((r) => r.data);

// Checkout (Sanctum auth)
export const getDeliverySlots = () =>
  apiClient
    .get<{ data: DeliverySlotResponse }>('/checkout/delivery-slots')
    .then((r) => r.data.data);

export const getPaymentMethods = () =>
  apiClient
    .get<{ data: { methods: PaymentMethodOption[] } }>('/checkout/payment-methods')
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
    .post<{ data: { order: Order; payment_url?: string } }>('/checkout', data)
    .then((r) => r.data.data);

// Orders (Sanctum auth)
export const getOrders = (page = 1, status?: string) =>
  apiClient
    .get<PaginatedResponse<Order>>('/orders', { params: { page, status: status !== 'all' ? status : undefined } })
    .then((r) => r.data);

export const getOrderDetail = (id: number) =>
  apiClient
    .get<{ data: OrderDetail }>(`/orders/${id}`)
    .then((r) => r.data.data);

export const reorderProducts = (orderId: number) =>
  apiClient
    .post<{ data: Cart }>(`/orders/${orderId}/reorder`)
    .then((r) => r.data.data);

// Profile (Sanctum auth)
export const getProfile = () =>
  apiClient.get<{ data: Profile }>('/profile').then((r) => r.data.data);

// Addresses (Sanctum auth)
export const getAddresses = () =>
  apiClient.get<{ data: Address[] }>('/addresses').then((r) => r.data.data);

export const createAddress = (
  data: Omit<Address, 'id' | 'user_id' | 'created_at'>,
) =>
  apiClient
    .post<{ data: Address }>('/addresses', data)
    .then((r) => r.data.data);

export const updateAddress = (id: number, data: Partial<Address>) =>
  apiClient
    .put<{ data: Address }>(`/addresses/${id}`, data)
    .then((r) => r.data.data);

export const deleteAddress = (id: number) =>
  apiClient.delete(`/addresses/${id}`);

export const setPrimaryAddress = (id: number) =>
  apiClient.put<{ data: Address }>(`/addresses/${id}/primary`).then((r) => r.data.data);

// Favorites (Sanctum auth)
export const getFavorites = () =>
  apiClient.get<{ data: Product[] }>('/favorites').then((r) => r.data.data);

export const addToFavorites = (productId: string) =>
  apiClient.post(`/favorites/${productId}`);

export const removeFromFavorites = (productId: string) =>
  apiClient.delete(`/favorites/${productId}`);

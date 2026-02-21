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
} from './types';

// Init
export const getStoreConfig = () =>
  apiClient.get<{ data: StoreConfig }>('/init').then((r) => r.data.data);

// Home
export const getHomeData = () =>
  apiClient.get<{ data: HomeData }>('/home').then((r) => r.data.data);

// Categories
export const getCategories = () =>
  apiClient.get<{ data: Category[] }>('/categories').then((r) => r.data.data);

// Products
export const getProducts = (params: ProductFilters) =>
  apiClient
    .get<PaginatedResponse<Product>>('/products', { params })
    .then((r) => r.data);

export const getProductDetail = (slug: string) =>
  apiClient
    .get<{ data: ProductDetail }>(`/products/${slug}`)
    .then((r) => r.data.data);

// Search
export const searchProducts = (query: string, page = 1) =>
  apiClient
    .get<PaginatedResponse<Product>>('/search', { params: { q: query, page } })
    .then((r) => r.data);

export const getPopularSearches = () =>
  apiClient
    .get<{ data: string[] }>('/search/popular')
    .then((r) => r.data.data);

// Cart
export const getCart = () =>
  apiClient.get<{ data: Cart }>('/cart').then((r) => r.data.data);

export const addToCart = (data: {
  product_id: number;
  quantity: number;
  variant_id?: number;
}) => apiClient.post<{ data: Cart }>('/cart', data).then((r) => r.data.data);

export const updateCartItem = (itemId: string, quantity: number) =>
  apiClient
    .put<{ data: Cart }>(`/cart/${itemId}`, { quantity })
    .then((r) => r.data.data);

export const removeCartItem = (itemId: string) =>
  apiClient.delete<{ data: Cart }>(`/cart/${itemId}`).then((r) => r.data.data);

export const applyPromoCode = (code: string) =>
  apiClient
    .post<{ data: { cart: Cart; promo: PromoCode } }>('/cart/promo', { code })
    .then((r) => r.data.data);

export const removePromoCode = () =>
  apiClient.delete<{ data: Cart }>('/cart/promo').then((r) => r.data.data);

// Checkout
export const checkout = (data: {
  address_id: number;
  delivery_method: 'delivery' | 'pickup';
  payment_method: 'click' | 'payme' | 'cash';
  notes?: string;
  promo_code?: string;
}) =>
  apiClient
    .post<{ data: { order: Order; payment_url?: string } }>('/checkout', data)
    .then((r) => r.data.data);

// Orders
export const getOrders = (page = 1) =>
  apiClient
    .get<PaginatedResponse<Order>>('/orders', { params: { page } })
    .then((r) => r.data);

export const getOrderDetail = (id: number) =>
  apiClient
    .get<{ data: OrderDetail }>(`/orders/${id}`)
    .then((r) => r.data.data);

export const reorderProducts = (orderId: number) =>
  apiClient
    .post<{ data: Cart }>(`/orders/${orderId}/reorder`)
    .then((r) => r.data.data);

// Profile
export const getProfile = () =>
  apiClient.get<{ data: { user: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string } } }>('/profile').then((r) => r.data.data);

// Addresses
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

// Favorites
export const getFavorites = () =>
  apiClient.get<{ data: Product[] }>('/favorites').then((r) => r.data.data);

export const addToFavorites = (productId: number) =>
  apiClient.post(`/favorites/${productId}`);

export const removeFromFavorites = (productId: number) =>
  apiClient.delete(`/favorites/${productId}`);

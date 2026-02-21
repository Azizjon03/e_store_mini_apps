import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LazyPage } from '@/components/ui/LazyPage';

const Home = lazy(() => import('@/pages/Home'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Search = lazy(() => import('@/pages/Search'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetail'));
const Profile = lazy(() => import('@/pages/Profile'));
const Addresses = lazy(() => import('@/pages/Addresses'));
const AddressForm = lazy(() => import('@/pages/AddressForm'));
const Favorites = lazy(() => import('@/pages/Favorites'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LazyPage><Home /></LazyPage> },
      { path: 'catalog', element: <LazyPage><Catalog /></LazyPage> },
      { path: 'catalog/:categorySlug', element: <LazyPage><Catalog /></LazyPage> },
      { path: 'product/:productSlug', element: <LazyPage><ProductDetail /></LazyPage> },
      { path: 'search', element: <LazyPage><Search /></LazyPage> },
      { path: 'cart', element: <LazyPage><Cart /></LazyPage> },
      { path: 'checkout', element: <LazyPage><Checkout /></LazyPage> },
      { path: 'order-success/:orderId', element: <LazyPage><OrderSuccess /></LazyPage> },
      { path: 'orders', element: <LazyPage><Orders /></LazyPage> },
      { path: 'orders/:orderId', element: <LazyPage><OrderDetailPage /></LazyPage> },
      { path: 'profile', element: <LazyPage><Profile /></LazyPage> },
      { path: 'profile/addresses', element: <LazyPage><Addresses /></LazyPage> },
      { path: 'profile/addresses/new', element: <LazyPage><AddressForm /></LazyPage> },
      { path: 'profile/addresses/:addressId', element: <LazyPage><AddressForm /></LazyPage> },
      { path: 'favorites', element: <LazyPage><Favorites /></LazyPage> },
    ],
  },
]);

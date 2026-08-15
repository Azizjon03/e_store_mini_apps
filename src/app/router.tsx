import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LazyPage } from '@/components/ui/LazyPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
// Eager, not lazy() — this is both the catch-all 404 element and the root
// errorElement, so it must render without depending on a chunk load that
// might itself be the thing that failed.
import NotFound from '@/pages/NotFound';

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
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    // Catches any thrown routing/render error (including a stale chunk after
    // a deploy) so the user lands on a real screen instead of React Router's
    // built-in dev error page — "Unexpected Application Error!" — which has
    // no navigation and no way back except reloading.
    errorElement: <NotFound />,
    children: [
      { index: true, element: <LazyPage><Home /></LazyPage> },
      { path: 'catalog', element: <LazyPage><Catalog /></LazyPage> },
      { path: 'catalog/:categorySlug', element: <LazyPage><Catalog /></LazyPage> },
      { path: 'product/:productSlug', element: <LazyPage><ProductDetail /></LazyPage> },
      { path: 'search', element: <LazyPage><Search /></LazyPage> },
      { path: 'cart', element: <LazyPage><Cart /></LazyPage> },
      { path: 'login', element: <LazyPage><Login /></LazyPage> },
      { path: 'register', element: <LazyPage><Register /></LazyPage> },

      // Auth-required pages
      {
        element: <ProtectedRoute />,
        children: [
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

      // Catch-all: any URL that doesn't match a route above (e.g. a backend
      // `link_url` pointing at a server-side path) renders a real 404 screen
      // instead of falling through to the router's default error page.
      { path: '*', element: <NotFound /> },
    ],
  },
]);

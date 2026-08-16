import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastContainer } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { showToast } from '@/lib/toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 min
      gcTime: 30 * 60 * 1000,       // 30 min
      // Two attempts back-to-back were not enough for the first request a
      // cold Telegram WebView makes: both landed inside the same connection
      // hiccup and the screen was left with no data. Three attempts spread
      // over ~3s survive that, while 4xx (a missing product, an expired
      // token) still fails immediately instead of being retried pointlessly.
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    onError: (_error, _variables, _context, mutation) => {
      // Only show global toast if mutation doesn't have its own onError
      if (!mutation.options.onError) {
        showToast('error', "Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    },
  }),
});

export function Providers() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

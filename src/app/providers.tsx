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
      retry: 1,
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

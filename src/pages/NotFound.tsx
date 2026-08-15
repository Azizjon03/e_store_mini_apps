import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * Doubles as the router's catch-all route element (a real, unmatched URL —
 * e.g. a backend `link_url` that points at a server-side path) and as the
 * root route's `errorElement` (a thrown rendering/loading error, including a
 * stale chunk after a deploy). `useRouteError()` returns `undefined` when
 * there is no error to catch — i.e. when this is rendered as a normal route
 * element rather than an error boundary — so the same screen degrades to a
 * plain 404 in that case.
 *
 * Imported eagerly (not `lazy()`) in `router.tsx` on purpose: this is the
 * fallback for a chunk failing to load, so it must not depend on a chunk
 * load of its own to appear.
 */
export default function NotFound() {
  const navigate = useNavigate();
  const error = useRouteError();
  const isNotFound = error === undefined || (isRouteErrorResponse(error) && error.status === 404);

  return (
    <PageLayout showSearch={false}>
      <EmptyState
        icon={isNotFound ? '🧭' : '😔'}
        title={isNotFound ? 'Sahifa topilmadi' : 'Nimadir xato ketdi'}
        description={
          isNotFound
            ? "Siz izlagan sahifa mavjud emas yoki manzil noto'g'ri"
            : "Kutilmagan xatolik yuz berdi. Qayta urinib ko'ring"
        }
        action={{ label: 'Bosh sahifaga qaytish', onClick: () => navigate('/') }}
      />
    </PageLayout>
  );
}

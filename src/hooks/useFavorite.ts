import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, addToFavorites, removeFromFavorites } from '@/api/storefront';
import { useAuthStore } from '@/store/authStore';
import { useHaptic } from './useHaptic';
import { showToast } from '@/lib/toast';

export function useFavorite(productId: number) {
  const queryClient = useQueryClient();
  const haptic = useHaptic();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const isFavorite = favorites?.some((p) => p.id === productId) ?? false;
  const isFavoriteRef = useRef(isFavorite);
  useEffect(() => { isFavoriteRef.current = isFavorite; });

  const toggleMutation = useMutation({
    mutationFn: () => (isFavoriteRef.current ? removeFromFavorites(String(productId)) : addToFavorites(String(productId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      haptic.impact('light');
    },
    onError: () => {
      showToast('error', 'Xatolik yuz berdi');
      haptic.notification('error');
    },
  });

  return {
    isFavorite,
    toggle: () => {
      if (!isAuthenticated) {
        navigate('/login?next=' + encodeURIComponent(window.location.pathname));
        return;
      }
      toggleMutation.mutate();
    },
    isPending: toggleMutation.isPending,
  };
}

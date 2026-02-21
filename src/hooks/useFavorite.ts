import { useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, addToFavorites, removeFromFavorites } from '@/api/storefront';
import { useHaptic } from './useHaptic';

export function useFavorite(productId: number) {
  const queryClient = useQueryClient();
  const haptic = useHaptic();

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    staleTime: 5 * 60 * 1000,
  });

  const isFavorite = favorites?.some((p) => p.id === productId) ?? false;
  const isFavoriteRef = useRef(isFavorite);
  useEffect(() => { isFavoriteRef.current = isFavorite; });

  const toggleMutation = useMutation({
    mutationFn: () => (isFavoriteRef.current ? removeFromFavorites(productId) : addToFavorites(productId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      haptic.impact('light');
    },
  });

  return {
    isFavorite,
    toggle: () => toggleMutation.mutate(),
    isPending: toggleMutation.isPending,
  };
}

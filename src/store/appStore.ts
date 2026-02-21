import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreConfig } from '@/api/types';

interface AppState {
  storeConfig: StoreConfig | null;
  language: string;
  isLoading: boolean;
  searchHistory: string[];

  setStoreConfig: (config: StoreConfig) => void;
  setLanguage: (lang: string) => void;
  setLoading: (loading: boolean) => void;
  addSearchHistory: (query: string) => void;
  removeSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      storeConfig: null,
      language: 'uz',
      isLoading: true,
      searchHistory: [],

      setStoreConfig: (config) => set({ storeConfig: config }),
      setLanguage: (language) => set({ language }),
      setLoading: (isLoading) => set({ isLoading }),

      addSearchHistory: (query) => {
        const history = get().searchHistory.filter((q) => q !== query);
        set({ searchHistory: [query, ...history].slice(0, 10) });
      },
      removeSearchHistory: (query) => {
        set({ searchHistory: get().searchHistory.filter((q) => q !== query) });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'e-store-app',
      partialize: (state) => ({
        language: state.language,
        searchHistory: state.searchHistory,
      }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/api/types';

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discount: number;
  deliveryCost: number;

  addItem: (product: Product, quantity: number, variant?: ProductVariant) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  setPromoCode: (code: string, discount: number) => void;
  removePromoCode: () => void;
  setDeliveryCost: (cost: number) => void;

  totalItems: () => number;
  subtotal: () => number;
  total: () => number;
}

function makeItemId(productId: number, variantId?: number) {
  return variantId ? `${productId}:${variantId}` : `${productId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discount: 0,
      deliveryCost: 0,

      addItem: (product, quantity, variant) => {
        const itemId = makeItemId(product.id, variant?.id);
        const items = get().items;
        const existing = items.find((i) => i.id === itemId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          });
        } else {
          const price = product.price + (variant?.extra_price ?? 0);
          set({
            items: [
              ...items,
              { id: itemId, product_id: product.id, product, quantity, variant, price },
            ],
          });
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i,
          ),
        });
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) });
      },

      clear: () => set({ items: [], promoCode: null, discount: 0 }),

      setPromoCode: (code, discount) => set({ promoCode: code, discount }),
      removePromoCode: () => set({ promoCode: null, discount: 0 }),
      setDeliveryCost: (cost) => set({ deliveryCost: cost }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      total: () => get().subtotal() - get().discount + get().deliveryCost,
    }),
    {
      name: 'e-store-cart',
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        discount: state.discount,
      }),
    },
  ),
);

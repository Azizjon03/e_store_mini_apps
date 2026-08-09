import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/api/types';

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discount: number;
  deliveryCost: number;

  addItem: (product: Product, quantity: number, variant?: ProductVariant) => void;
  /** Merge pre-built lines (reorder) into the cart, summing quantity on lines that already exist. */
  mergeItems: (items: CartItem[]) => void;
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

/**
 * Cart line identity. Reorder builds lines outside the store, so this is exported —
 * an id computed any other way silently fails to merge with an added line.
 * Note the storefront currently returns variants without an `id`, so a variant
 * without one collapses onto the product-level line rather than producing
 * `"<productId>:undefined"`.
 */
export function makeItemId(productId: number, variantId?: number) {
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

      mergeItems: (incoming) => {
        const items = [...get().items];
        for (const line of incoming) {
          const index = items.findIndex((i) => i.id === line.id);
          if (index >= 0) {
            items[index] = { ...items[index], quantity: items[index].quantity + line.quantity };
          } else {
            items.push(line);
          }
        }
        set({ items });
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

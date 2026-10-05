"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  sizeLabel: string;
  colorLabel: string;
  price: number; // centimes, indicatif : le serveur recalcule au checkout
  quantity: number;
  maxStock: number;
};

/** Règle du code promo : la remise est recalculée à chaque changement du panier. */
export type AppliedPromo = { code: string; type: string; value: number; minSubtotal: number };

export type VariantSnapshot = { variantId: string; price: number; stock: number; name: string } | { variantId: string; missing: true };

type CartState = {
  items: CartItem[];
  promo: AppliedPromo | null;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setPromo: (promo: AppliedPromo | null) => void;
  /** Met à jour prix et stocks à partir des données serveur ; retire les articles disparus. */
  sync: (snapshots: VariantSnapshot[]) => void;
};

export const MAX_PER_ITEM = 20;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promo: null,
      add: (item, quantity = 1) =>
        set((state) => {
          const limit = Math.min(item.maxStock, MAX_PER_ITEM);
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, limit) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: Math.min(quantity, limit) }] };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock, MAX_PER_ITEM)) }
              : i,
          ),
        })),
      remove: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [], promo: null }),
      setPromo: (promo) => set({ promo }),
      sync: (snapshots) =>
        set((state) => {
          const byId = new Map(snapshots.map((s) => [s.variantId, s]));
          const items = state.items.flatMap((item) => {
            const snap = byId.get(item.variantId);
            if (!snap || "missing" in snap || snap.stock === 0) return [];
            return [
              {
                ...item,
                name: snap.name,
                price: snap.price,
                maxStock: snap.stock,
                quantity: Math.min(item.quantity, snap.stock, MAX_PER_ITEM),
              },
            ];
          });
          return { items };
        }),
    }),
    { name: "mkfit-cart" },
  ),
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

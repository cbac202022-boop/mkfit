"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/** Vide le panier une fois la commande confirmée. */
export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => clear(), [clear]);
  return null;
}

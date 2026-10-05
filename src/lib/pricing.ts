// Règles de prix partagées entre le client (affichage) et le serveur (source de vérité).

export const FREE_SHIPPING_THRESHOLD = 6000; // 60 €

export const SHIPPING_METHODS = {
  STANDARD: {
    label: "Livraison standard",
    description: "3 à 5 jours ouvrés",
    price: 490,
    freeAboveThreshold: true,
  },
  PICKUP: {
    label: "Point relais",
    description: "3 à 5 jours ouvrés",
    price: 390,
    freeAboveThreshold: true,
  },
  EXPRESS: {
    label: "Express",
    description: "Livré en 24 à 48 h",
    price: 990,
    freeAboveThreshold: false,
  },
} as const;

export type ShippingMethod = keyof typeof SHIPPING_METHODS;

export function shippingCost(method: ShippingMethod, subtotalAfterDiscount: number) {
  const m = SHIPPING_METHODS[method];
  if (m.freeAboveThreshold && subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD) return 0;
  return m.price;
}

export type PromoLike = {
  code: string;
  type: string;
  value: number;
  minSubtotal: number;
  active: boolean;
  expiresAt: Date | null;
};

export type PromoCheck = { valid: true; discount: number } | { valid: false; error: string };

export function checkPromo(promo: PromoLike | null, subtotal: number): PromoCheck {
  if (!promo || !promo.active) return { valid: false, error: "Ce code promo n'existe pas." };
  if (promo.expiresAt && promo.expiresAt < new Date())
    return { valid: false, error: "Ce code promo a expiré." };
  if (subtotal < promo.minSubtotal) {
    const min = (promo.minSubtotal / 100).toFixed(2).replace(".", ",");
    return { valid: false, error: `Ce code nécessite un minimum d'achat de ${min} €.` };
  }
  const discount =
    promo.type === "PERCENT" ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return { valid: true, discount: Math.min(discount, subtotal) };
}

/** Calcul côté client à partir de la règle mémorisée dans le panier. */
export function promoDiscount(
  promo: { code: string; type: string; value: number; minSubtotal: number } | null,
  subtotal: number,
): PromoCheck | null {
  if (!promo) return null;
  return checkPromo({ ...promo, active: true, expiresAt: null }, subtotal);
}

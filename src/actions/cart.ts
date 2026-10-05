"use server";

import { prisma } from "@/lib/prisma";
import { checkPromo } from "@/lib/pricing";
import type { AppliedPromo, VariantSnapshot } from "@/lib/cart-store";

/** Prix et stocks à jour pour les variantes du panier. */
export async function getCartSnapshots(variantIds: string[]): Promise<VariantSnapshot[]> {
  const ids = variantIds.slice(0, 100);
  const variants = await prisma.variant.findMany({
    where: { id: { in: ids } },
    select: { id: true, stock: true, product: { select: { price: true, name: true, active: true } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));
  return ids.map((id) => {
    const v = byId.get(id);
    if (!v || !v.product.active) return { variantId: id, missing: true as const };
    return { variantId: id, price: v.product.price, stock: v.stock, name: v.product.name };
  });
}

export async function validatePromoCode(
  rawCode: string,
  subtotal: number,
): Promise<{ ok: true; promo: AppliedPromo } | { ok: false; error: string }> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Saisissez un code promo." };
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  const result = checkPromo(promo, subtotal);
  if (!result.valid || !promo) return { ok: false, error: result.valid ? "Code invalide." : result.error };
  return { ok: true, promo: { code: promo.code, type: promo.type, value: promo.value, minSubtotal: promo.minSubtotal } };
}

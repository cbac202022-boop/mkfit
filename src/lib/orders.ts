import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { checkPromo, shippingCost, SHIPPING_METHODS } from "@/lib/pricing";
import type { CheckoutInput } from "@/lib/validations";

export class CheckoutError extends Error {}

function orderNumber() {
  const d = new Date();
  const date = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `MK${date}-${randomInt(100000, 999999)}`;
}

/**
 * Crée une commande « en attente » à partir du panier.
 * Les prix, le stock et le code promo sont TOUJOURS revérifiés ici : on ne fait jamais confiance au client.
 */
export async function createPendingOrder(input: CheckoutInput, userId: string | null) {
  // Fusionne les éventuels doublons de variantes
  const quantities = new Map<string, number>();
  for (const item of input.items) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);

  const variants = await prisma.variant.findMany({
    where: { id: { in: [...quantities.keys()] } },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  });

  const lines = [...quantities.entries()].map(([variantId, quantity]) => {
    const v = variants.find((x) => x.id === variantId);
    if (!v || !v.product.active) throw new CheckoutError("Un article de votre panier n'est plus disponible.");
    if (v.stock < quantity)
      throw new CheckoutError(
        v.stock === 0
          ? `« ${v.product.name} » (${v.color}, ${v.size}) est épuisé.`
          : `Il ne reste que ${v.stock} « ${v.product.name} » (${v.color}, ${v.size}) en stock.`,
      );
    return { variant: v, quantity };
  });

  const subtotal = lines.reduce((s, l) => s + l.variant.product.price * l.quantity, 0);

  let discount = 0;
  let promoCode: string | null = null;
  if (input.promoCode) {
    const promo = await prisma.promoCode.findUnique({ where: { code: input.promoCode } });
    const result = checkPromo(promo, subtotal);
    if (!result.valid) throw new CheckoutError(result.error);
    discount = result.discount;
    promoCode = promo!.code;
  }

  const shipping = shippingCost(input.shippingMethod, subtotal - discount);
  const total = subtotal - discount + shipping;
  const a = input.address;

  const order = await prisma.order.create({
    data: {
      number: orderNumber(),
      userId,
      email: input.email,
      subtotal,
      discount,
      shippingCost: shipping,
      total,
      promoCode,
      shippingMethod: input.shippingMethod,
      shippingName: a.fullName,
      shippingLine1: a.line1,
      shippingLine2: a.line2 || null,
      shippingPostal: a.postalCode,
      shippingCity: a.city,
      shippingCountry: a.country,
      shippingPhone: a.phone || null,
      items: {
        create: lines.map(({ variant, quantity }) => ({
          productId: variant.productId,
          variantId: variant.id,
          name: variant.product.name,
          size: variant.size,
          color: variant.color,
          image: variant.product.images[0]?.url ?? null,
          unitPrice: variant.product.price,
          quantity,
        })),
      },
    },
    include: { items: true },
  });

  if (userId && input.saveAddress) {
    const count = await prisma.address.count({ where: { userId } });
    await prisma.address.create({
      data: {
        userId,
        fullName: a.fullName,
        line1: a.line1,
        line2: a.line2 || null,
        postalCode: a.postalCode,
        city: a.city,
        country: a.country,
        phone: a.phone || null,
        isDefault: count === 0,
      },
    });
  }

  return { order, shippingLabel: SHIPPING_METHODS[input.shippingMethod].label };
}

/**
 * Passe une commande en « payée » et décrémente le stock.
 * Idempotent : appelé à la fois par le webhook Stripe et par la page de confirmation,
 * seul le premier appel modifie les stocks.
 */
export async function markOrderPaid(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (updated.count === 0) return false;

    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (item.variantId) {
        await tx.variant.updateMany({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
        // Garde-fou : jamais de stock négatif
        await tx.variant.updateMany({ where: { id: item.variantId, stock: { lt: 0 } }, data: { stock: 0 } });
      }
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { salesCount: { increment: item.quantity } },
        });
      }
    }
    return true;
  });
}

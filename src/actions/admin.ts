"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOrderStatus } from "@/lib/site";
import { markOrderPaid } from "@/lib/orders";
import { eurosToCents, slugify } from "@/lib/utils";
import { categorySchema, fieldErrors, productSchema, type FormState, type ProductInput } from "@/lib/validations";

function revalidateShop() {
  revalidatePath("/", "layout");
}

// ——— Produits ———

export async function saveProduct(
  id: string | null,
  input: ProductInput,
): Promise<FormState & { id?: string }> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Le formulaire contient des erreurs." };

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  const keys = data.variants.map((v) => `${v.size.toLowerCase()}|${v.color.toLowerCase()}`);
  if (new Set(keys).size !== keys.length) {
    return { ok: false, message: "Deux variantes ont la même taille et la même couleur." };
  }

  const clash = await prisma.product.findFirst({ where: { slug, ...(id && { id: { not: id } }) } });
  if (clash) return { ok: false, errors: { slug: "Ce slug est déjà utilisé par un autre produit." } };

  const productData = {
    name: data.name,
    slug,
    description: data.description,
    price: eurosToCents(data.price),
    compareAtPrice: data.compareAtPrice ? eurosToCents(data.compareAtPrice) : null,
    brand: data.brand,
    categoryId: data.categoryId,
    featured: data.featured,
    active: data.active,
    sizeLabel: data.sizeLabel,
    colorLabel: data.colorLabel,
  };
  const images = data.images.map((url, position) => ({
    url,
    alt: position === 0 ? data.name : `${data.name} – vue ${position + 1}`,
    position,
  }));
  const sku = (size: string, color: string) => `${slug}-${slugify(color)}-${slugify(size)}`.toUpperCase();

  try {
    const productId = await prisma.$transaction(async (tx) => {
      if (!id) {
        const created = await tx.product.create({
          data: {
            ...productData,
            images: { create: images },
            variants: {
              create: data.variants.map((v) => ({ size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, sku: sku(v.size, v.color) })),
            },
          },
        });
        return created.id;
      }

      await tx.product.update({ where: { id }, data: productData });
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({ data: images.map((img) => ({ ...img, productId: id })) });

      const keepIds = data.variants.flatMap((v) => (v.id ? [v.id] : []));
      await tx.variant.deleteMany({ where: { productId: id, id: { notIn: keepIds } } });
      // SKU temporaires pour éviter les conflits d'unicité pendant la mise à jour
      for (const v of data.variants.filter((v) => v.id)) {
        await tx.variant.update({ where: { id: v.id }, data: { sku: `TMP-${v.id}` } });
      }
      for (const v of data.variants) {
        const values = { size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, sku: sku(v.size, v.color) };
        if (v.id) await tx.variant.update({ where: { id: v.id, productId: id }, data: values });
        else await tx.variant.create({ data: { ...values, productId: id } });
      }
      return id;
    });

    revalidateShop();
    return { ok: true, id: productId, message: "Produit enregistré." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "Conflit d'unicité (slug, SKU ou variante en double)." };
    }
    throw error;
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  // Les lignes de commande gardent une copie des infos produit (relation SetNull)
  await prisma.product.delete({ where: { id } });
  revalidateShop();
}

export async function updateStock(variantId: string, stock: number) {
  await requireAdmin();
  if (!Number.isInteger(stock) || stock < 0) return { ok: false };
  await prisma.variant.update({ where: { id: variantId }, data: { stock } });
  revalidateShop();
  return { ok: true };
}

// ——— Catégories ———

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const id = formData.get("id")?.toString() || null;
  const slug = parsed.data.slug || slugify(parsed.data.name);
  const clash = await prisma.category.findFirst({ where: { slug, ...(id && { id: { not: id } }) } });
  if (clash) return { ok: false, errors: { slug: "Ce slug est déjà utilisé." } };

  const data = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    image: parsed.data.image || null,
  };
  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    const position = await prisma.category.count();
    await prisma.category.create({ data: { ...data, position } });
  }
  revalidateShop();
  return { ok: true, message: id ? "Catégorie mise à jour." : "Catégorie créée." };
}

export async function deleteCategory(id: string): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return { ok: false, message: `Impossible : ${count} produit(s) appartiennent à cette catégorie.` };
  }
  await prisma.category.delete({ where: { id } });
  revalidateShop();
  return { ok: true };
}

// ——— Commandes ———

export async function updateOrderStatus(orderId: string, status: string): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  if (!isOrderStatus(status)) return { ok: false, message: "Statut inconnu." };

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { ok: false, message: "Commande introuvable." };
  if (order.status === status) return { ok: true };
  if (order.status === "CANCELLED") return { ok: false, message: "Une commande annulée ne peut pas être réactivée." };

  const paidStatuses = ["PAID", "SHIPPED", "DELIVERED"];

  // En attente → payée/expédiée/livrée : même traitement qu'un paiement (décrément du stock)
  if (order.status === "PENDING" && paidStatuses.includes(status)) {
    await markOrderPaid(orderId);
  }

  await prisma.$transaction(async (tx) => {
    // Annulation d'une commande déjà payée : on remet les articles en stock
    if (status === "CANCELLED" && paidStatuses.includes(order.status)) {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.variant.updateMany({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        }
      }
    }
    await tx.order.update({ where: { id: orderId }, data: { status } });
  });

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${orderId}`);
  return { ok: true, message: "Statut mis à jour." };
}

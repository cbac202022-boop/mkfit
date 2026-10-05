"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fieldErrors, reviewSchema, type FormState } from "@/lib/validations";

export async function addReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session?.user) return { ok: false, message: "Vous devez être connecté pour laisser un avis." };

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { productId, ...data } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (!product) return { ok: false, message: "Produit introuvable." };

  await prisma.review.upsert({
    where: { productId_userId: { productId, userId: session.user.id } },
    create: { productId, userId: session.user.id, ...data },
    update: data,
  });

  revalidatePath(`/produit/${product.slug}`);
  return { ok: true, message: "Merci pour votre avis !" };
}

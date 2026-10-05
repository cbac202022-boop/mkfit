"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(
  productId: string,
): Promise<{ ok: true; favorite: boolean } | { ok: false; needsAuth: true }> {
  const session = await getSession();
  if (!session?.user) return { ok: false, needsAuth: true };

  const key = { userId_productId: { userId: session.user.id, productId } };
  const existing = await prisma.favorite.findUnique({ where: key });

  if (existing) {
    await prisma.favorite.delete({ where: key });
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, productId } });
  }
  revalidatePath("/compte/favoris");
  return { ok: true, favorite: !existing };
}

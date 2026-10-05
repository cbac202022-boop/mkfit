"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema, fieldErrors, registerSchema, type FormState } from "@/lib/validations";

export async function registerUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, errors: { email: "Un compte existe déjà avec cette adresse email." } };

  await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  // La connexion est faite côté client avec signIn() une fois le compte créé.
  return { ok: true };
}

export async function saveAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/compte/adresses");
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const id = formData.get("id")?.toString();
  const isDefault = formData.get("isDefault") === "on";
  const data = { ...parsed.data, line2: parsed.data.line2 || null, phone: parsed.data.phone || null };

  await prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId: user.id } });
    const makeDefault = isDefault || count === 0;
    if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });

    if (id) {
      // updateMany + userId : impossible de modifier l'adresse d'un autre utilisateur
      await tx.address.updateMany({ where: { id, userId: user.id }, data: { ...data, ...(makeDefault && { isDefault: true }) } });
    } else {
      await tx.address.create({ data: { ...data, userId: user.id, isDefault: makeDefault } });
    }
  });

  revalidatePath("/compte/adresses");
  return { ok: true, message: id ? "Adresse mise à jour." : "Adresse ajoutée." };
}

export async function deleteAddress(id: string) {
  const user = await requireUser("/compte/adresses");
  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/compte/adresses");
}

export async function setDefaultAddress(id: string) {
  const user = await requireUser("/compte/adresses");
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    prisma.address.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/compte/adresses");
}

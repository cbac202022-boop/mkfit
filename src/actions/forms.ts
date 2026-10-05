"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema, fieldErrors, newsletterSchema, type FormState } from "@/lib/validations";

export async function subscribeNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email },
    update: {},
  });
  return { ok: true, message: "Merci ! Vous êtes inscrit·e à la newsletter MKFit." };
}

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  // Le message est enregistré en base ; brancher ici un service d'email (Resend, SMTP…) en production.
  await prisma.contactMessage.create({ data: parsed.data });
  return { ok: true, message: "Votre message a bien été envoyé. Nous vous répondons sous 48 h ouvrées." };
}

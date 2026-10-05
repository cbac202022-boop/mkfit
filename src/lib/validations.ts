import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Adresse email invalide.");
const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres et tirets).")
  .optional()
  .or(z.literal(""));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Mot de passe requis."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Votre nom doit contenir au moins 2 caractères.").max(80),
    email,
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm"],
  });

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Nom complet requis.").max(100),
  line1: z.string().trim().min(3, "Adresse requise.").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  postalCode: z.string().trim().regex(/^[0-9A-Za-z -]{4,10}$/, "Code postal invalide."),
  city: z.string().trim().min(2, "Ville requise.").max(100),
  country: z.string().trim().min(2, "Pays requis.").max(60),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9 +().-]{6,20}$/, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  email,
  address: addressSchema,
  shippingMethod: z.enum(["STANDARD", "PICKUP", "EXPRESS"]),
  promoCode: z.string().trim().toUpperCase().optional(),
  saveAddress: z.boolean().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Votre panier est vide."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number({ message: "Choisissez une note." }).int().min(1, "Choisissez une note.").max(5),
  title: z.string().trim().min(2, "Titre requis.").max(100),
  comment: z.string().trim().min(10, "Votre avis doit contenir au moins 10 caractères.").max(2000),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Nom requis.").max(100),
  email,
  subject: z.string().trim().min(2, "Sujet requis.").max(150),
  message: z
    .string()
    .trim()
    .min(10, "Votre message doit contenir au moins 10 caractères.")
    .max(5000),
});

export const newsletterSchema = z.object({ email });

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nom requis.").max(150),
  slug,
  description: z.string().trim().min(10, "Description trop courte (10 caractères minimum)."),
  price: z.number().positive("Prix invalide."),
  compareAtPrice: z.number().nonnegative().nullable(),
  brand: z.string().trim().min(1, "Marque requise.").max(80),
  categoryId: z.string().min(1, "Catégorie requise."),
  featured: z.boolean(),
  active: z.boolean(),
  sizeLabel: z.string().trim().min(1).max(30),
  colorLabel: z.string().trim().min(1).max(30),
  images: z.array(z.string().url("URL d'image invalide.")).min(1, "Au moins une image est requise."),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string().trim().min(1, "Taille requise."),
        color: z.string().trim().min(1, "Couleur requise."),
        colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hexadécimale invalide."),
        stock: z.number().int().min(0, "Stock invalide."),
      }),
    )
    .min(1, "Au moins une variante est requise."),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nom requis.").max(80),
  slug,
  description: z.string().trim().max(500).optional().or(z.literal("")),
  image: z.string().url("URL invalide.").optional().or(z.literal("")),
});

/** Transforme les erreurs Zod en { champ: message } pour l'affichage dans les formulaires. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

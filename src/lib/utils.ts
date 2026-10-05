import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** Formate un montant en centimes : 2990 → « 29,90 € » */
export function formatPrice(cents: number) {
  return euro.format(cents / 100);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(date));
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Convertit « 29,90 » ou 29.9 (euros) en centimes. */
export function eurosToCents(value: string | number) {
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Math.round(n * 100);
}

export function averageRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

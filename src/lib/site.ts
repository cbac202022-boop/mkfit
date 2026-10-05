export const siteConfig = {
  name: "MKFit",
  description:
    "MKFit, la boutique des sportifs : vêtements, chaussures, accessoires, équipement de musculation et nutrition. Livraison offerte dès 60 €.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "contact@mkfit.fr",
  phone: "01 23 45 67 89",
  address: "12 rue du Stade, 75015 Paris",
};

export const mainNav = [
  { label: "Vêtements", href: "/boutique/vetements" },
  { label: "Chaussures", href: "/boutique/chaussures" },
  { label: "Accessoires", href: "/boutique/accessoires" },
  { label: "Musculation", href: "/boutique/musculation" },
  { label: "Nutrition", href: "/boutique/nutrition" },
];

export const ORDER_STATUSES = {
  PENDING: { label: "En attente de paiement", className: "bg-amber-100 text-amber-900" },
  PAID: { label: "Payée", className: "bg-blue-100 text-blue-900" },
  SHIPPED: { label: "Expédiée", className: "bg-violet-100 text-violet-900" },
  DELIVERED: { label: "Livrée", className: "bg-green-100 text-green-900" },
  CANCELLED: { label: "Annulée", className: "bg-red-100 text-red-900" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

export function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUSES;
}

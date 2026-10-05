import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { parseFilters } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: "Boutique — Tous les produits",
  description: "Vêtements, chaussures, accessoires, musculation et nutrition : tout l'équipement sportif MKFit.",
  alternates: { canonical: "/boutique" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  return (
    <CatalogView
      title="Tous les produits"
      description="Tout l'équipement MKFit pour s'entraîner, courir, récupérer et progresser."
      basePath="/boutique"
      filters={filters}
      breadcrumbs={[{ label: "Boutique" }]}
      showCategories
    />
  );
}

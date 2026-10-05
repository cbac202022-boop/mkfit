import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { parseFilters } from "@/lib/catalog-params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: typeof q === "string" && q ? `Recherche « ${q} »` : "Recherche",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams);

  if (!filters.q) {
    return (
      <div className="container py-16">
        <EmptyState title="Que recherchez-vous ?" action={<ButtonLink href="/boutique" variant="dark">Voir la boutique</ButtonLink>}>
          Utilisez la barre de recherche en haut de page pour trouver un produit, une marque ou une catégorie.
        </EmptyState>
      </div>
    );
  }

  return (
    <CatalogView
      title={`Résultats pour « ${filters.q} »`}
      basePath="/recherche"
      filters={filters}
      breadcrumbs={[{ label: "Recherche" }]}
    />
  );
}

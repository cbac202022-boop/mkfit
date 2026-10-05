import Link from "next/link";
import { X } from "lucide-react";
import { Breadcrumbs, EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-card";
import { FilterPanel } from "@/components/catalog/filter-panel";
import { SortSelect } from "@/components/catalog/sort-select";
import { Pagination } from "@/components/catalog/pagination";
import { getCatalog, getCategories, getFacets, getFavoriteIds } from "@/lib/catalog";
import { buildCatalogHref, type CatalogFilters } from "@/lib/catalog-params";

type Props = {
  title: string;
  description?: string | null;
  basePath: string;
  filters: CatalogFilters;
  breadcrumbs: { label: string; href?: string }[];
  showCategories?: boolean;
};

/** Page de liste produits réutilisée par /boutique, /boutique/[categorie] et /recherche. */
export async function CatalogView({ title, description, basePath, filters, breadcrumbs, showCategories }: Props) {
  const [{ products, total, pageCount }, facets, favoriteIds, categories] = await Promise.all([
    getCatalog(filters),
    getFacets(filters),
    getFavoriteIds(),
    showCategories ? getCategories() : Promise.resolve(undefined),
  ]);

  const chips = [
    ...filters.sizes.map((v) => ({ label: `Taille ${v}`, href: buildCatalogHref(basePath, filters, { sizes: filters.sizes.filter((s) => s !== v) }) })),
    ...filters.colors.map((v) => ({ label: v, href: buildCatalogHref(basePath, filters, { colors: filters.colors.filter((s) => s !== v) }) })),
    ...filters.brands.map((v) => ({ label: v, href: buildCatalogHref(basePath, filters, { brands: filters.brands.filter((s) => s !== v) }) })),
    ...(filters.minPrice !== undefined
      ? [{ label: `Dès ${filters.minPrice} €`, href: buildCatalogHref(basePath, filters, { minPrice: undefined }) }]
      : []),
    ...(filters.maxPrice !== undefined
      ? [{ label: `Jusqu'à ${filters.maxPrice} €`, href: buildCatalogHref(basePath, filters, { maxPrice: undefined }) }]
      : []),
  ];

  return (
    <div className="container py-8">
      <Breadcrumbs items={breadcrumbs} />
      <header className="mb-8 mt-6">
        <h1 className="heading-lg">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink-500">{description}</p>}
      </header>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <FilterPanel
            basePath={basePath}
            filters={filters}
            facets={facets}
            categories={categories?.map((c) => ({ name: c.name, slug: c.slug }))}
          />
        </div>

        <section aria-label="Résultats">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-500" role="status">
              <strong className="text-ink">{total}</strong> produit{total > 1 ? "s" : ""}
            </p>
            <SortSelect basePath={basePath} filters={filters} />
          </div>

          {chips.length > 0 && (
            <ul className="mb-6 flex flex-wrap gap-2" aria-label="Filtres actifs">
              {chips.map((chip) => (
                <li key={chip.label}>
                  <Link
                    href={chip.href}
                    scroll={false}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 py-1.5 pl-3 pr-2 text-sm font-medium hover:bg-ink-200"
                  >
                    {chip.label}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">(retirer ce filtre)</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} favoriteIds={favoriteIds} priorityCount={4} />
              <Pagination
                page={filters.page}
                pageCount={pageCount}
                hrefFor={(page) => buildCatalogHref(basePath, filters, { page })}
              />
            </>
          ) : (
            <EmptyState
              title="Aucun produit trouvé"
              action={<ButtonLink href={basePath === "/recherche" ? "/boutique" : basePath} variant="dark">Réinitialiser</ButtonLink>}
            >
              Essayez d&apos;élargir vos critères ou de retirer certains filtres.
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}

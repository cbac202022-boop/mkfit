"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activeFilterCount, buildCatalogHref, toggle, type CatalogFilters } from "@/lib/catalog-params";
import { cn } from "@/lib/utils";

export type Facets = {
  brands: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  minPrice: number;
  maxPrice: number;
};

type Props = {
  basePath: string;
  filters: CatalogFilters;
  facets: Facets;
  categories?: { name: string; slug: string }[];
};

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-ink-200 py-6 first:pt-0">
      <legend className="eyebrow mb-4 float-left w-full">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function Filters({ basePath, filters, facets, categories }: Props) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "");

  useEffect(() => {
    setMinPrice(filters.minPrice?.toString() ?? "");
    setMaxPrice(filters.maxPrice?.toString() ?? "");
  }, [filters.minPrice, filters.maxPrice]);

  const go = (overrides: Partial<CatalogFilters>) =>
    router.push(buildCatalogHref(basePath, filters, overrides), { scroll: false });

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    go({
      minPrice: minPrice === "" ? undefined : Math.max(0, Number(minPrice)),
      maxPrice: maxPrice === "" ? undefined : Math.max(0, Number(maxPrice)),
    });
  }

  return (
    <div>
      {categories && (
        <FilterGroup title="Catégorie">
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={buildCatalogHref("/boutique", filters)}
                aria-current={!filters.category ? "page" : undefined}
                className="hover:underline aria-[current=page]:font-semibold aria-[current=page]:underline aria-[current=page]:underline-offset-4"
              >
                Tous les produits
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={buildCatalogHref(`/boutique/${c.slug}`, filters)}
                  aria-current={filters.category === c.slug ? "page" : undefined}
                  className="hover:underline aria-[current=page]:font-semibold aria-[current=page]:underline aria-[current=page]:underline-offset-4"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Prix (€)">
        <form onSubmit={applyPrice} className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="prix-min" className="mb-1 block text-xs text-ink-500">
              Min.
            </label>
            <input
              id="prix-min"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={String(facets.minPrice)}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-10 w-full rounded-lg border-ink-300 text-sm focus:border-ink focus:ring-ink"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="prix-max" className="mb-1 block text-xs text-ink-500">
              Max.
            </label>
            <input
              id="prix-max"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={String(facets.maxPrice)}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-10 w-full rounded-lg border-ink-300 text-sm focus:border-ink focus:ring-ink"
            />
          </div>
          <Button type="submit" variant="dark" size="sm" className="h-10">
            OK
          </Button>
        </form>
      </FilterGroup>

      {facets.sizes.length > 1 && (
        <FilterGroup title="Taille">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((size) => {
              const checked = filters.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => go({ sizes: toggle(filters.sizes, size) })}
                  className={cn(
                    "h-10 min-w-12 rounded-lg border px-3 text-sm font-semibold transition-colors",
                    checked ? "border-ink bg-ink text-white" : "border-ink-300 hover:border-ink",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {facets.colors.length > 1 && (
        <FilterGroup title="Couleur">
          <div className="grid grid-cols-2 gap-2">
            {facets.colors.map((color) => {
              const checked = filters.colors.includes(color.name);
              return (
                <button
                  key={color.name}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => go({ colors: toggle(filters.colors, color.name) })}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm",
                    checked ? "border-ink bg-ink-100 font-semibold" : "border-transparent hover:border-ink-300",
                  )}
                >
                  <span
                    className="relative flex h-5 w-5 flex-none items-center justify-center rounded-full border border-ink-300"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  >
                    {checked && <Check className="h-3 w-3 text-ink mix-blend-difference invert" />}
                  </span>
                  <span className="truncate">{color.name}</span>
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {facets.brands.length > 1 && (
        <FilterGroup title="Marque">
          <ul className="space-y-2">
            {facets.brands.map((brand) => {
              const id = `marque-${brand.replace(/\s+/g, "-")}`;
              return (
                <li key={brand} className="flex items-center gap-2">
                  <input
                    id={id}
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => go({ brands: toggle(filters.brands, brand) })}
                    className="h-4 w-4 rounded border-ink-300 text-ink focus:ring-ink"
                  />
                  <label htmlFor={id} className="text-sm">
                    {brand}
                  </label>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      )}
    </div>
  );
}

/** Colonne de filtres sur desktop, panneau coulissant sur mobile. */
export function FilterPanel(props: Props) {
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(props.filters);
  const reset = buildCatalogHref(props.basePath, {
    ...props.filters,
    sizes: [],
    colors: [],
    brands: [],
    minPrice: undefined,
    maxPrice: undefined,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)} aria-expanded={open}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filtres{count > 0 && ` (${count})`}
      </Button>

      <aside className="hidden lg:block" aria-label="Filtres">
        <Filters {...props} />
        {count > 0 && (
          <Link href={reset} className="mt-6 inline-block text-sm font-semibold underline underline-offset-4">
            Effacer les filtres ({count})
          </Link>
        )}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 flex w-[90%] max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between border-b border-ink-200 p-4">
              <p className="heading-md">Filtres</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-100"
                aria-label="Fermer les filtres"
                autoFocus
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Filters {...props} />
            </div>
            <div className="flex gap-2 border-t border-ink-200 p-4">
              {count > 0 && (
                <Link href={reset} className="flex-1 py-3 text-center text-sm font-semibold underline">
                  Tout effacer
                </Link>
              )}
              <Button variant="dark" className="flex-1" onClick={() => setOpen(false)}>
                Voir les produits
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

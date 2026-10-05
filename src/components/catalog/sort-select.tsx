"use client";

import { useRouter } from "next/navigation";
import { buildCatalogHref, SORT_LABELS, type CatalogFilters, type SortKey } from "@/lib/catalog-params";

export function SortSelect({ basePath, filters }: { basePath: string; filters: CatalogFilters }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="tri" className="whitespace-nowrap text-sm text-ink-500">
        Trier par
      </label>
      <select
        id="tri"
        value={filters.sort}
        onChange={(e) =>
          router.push(buildCatalogHref(basePath, filters, { sort: e.target.value as SortKey }), { scroll: false })
        }
        className="h-9 rounded-full border-ink-300 py-0 pl-4 pr-9 text-sm font-semibold focus:border-ink focus:ring-ink"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

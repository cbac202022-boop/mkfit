// Lecture / écriture des filtres du catalogue dans l'URL. Utilisable côté client et serveur.

export const SORT_LABELS = {
  popularite: "Popularité",
  nouveautes: "Nouveautés",
  "prix-asc": "Prix croissant",
  "prix-desc": "Prix décroissant",
} as const;

export type SortKey = keyof typeof SORT_LABELS;

export type CatalogFilters = {
  category?: string;
  q?: string;
  minPrice?: number; // euros
  maxPrice?: number; // euros
  sizes: string[];
  colors: string[];
  brands: string[];
  sort: SortKey;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function list(value: string | string[] | undefined) {
  if (!value) return [];
  return (Array.isArray(value) ? value : value.split(",")).map((v) => v.trim()).filter(Boolean);
}

function num(value: string | string[] | undefined) {
  if (typeof value !== "string" || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Lit les filtres depuis l'URL : ?taille=M,L&couleur=Noir&marque=MKFit&prixMin=20&tri=prix-asc&page=2 */
export function parseFilters(params: RawParams, category?: string): CatalogFilters {
  const sort =
    typeof params.tri === "string" && params.tri in SORT_LABELS ? (params.tri as SortKey) : "popularite";
  return {
    category: category ?? (typeof params.categorie === "string" ? params.categorie : undefined),
    q: typeof params.q === "string" && params.q.trim() ? params.q.trim().slice(0, 100) : undefined,
    minPrice: num(params.prixMin),
    maxPrice: num(params.prixMax),
    sizes: list(params.taille),
    colors: list(params.couleur),
    brands: list(params.marque),
    sort,
    page: Math.max(1, Math.floor(num(params.page) ?? 1)),
  };
}

/** Construit l'URL du catalogue. Tout changement de filtre ramène à la page 1, sauf changement de page explicite. */
export function buildCatalogHref(basePath: string, f: CatalogFilters, overrides: Partial<CatalogFilters> = {}) {
  const next = { ...f, page: 1, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.sizes.length) params.set("taille", next.sizes.join(","));
  if (next.colors.length) params.set("couleur", next.colors.join(","));
  if (next.brands.length) params.set("marque", next.brands.join(","));
  if (next.minPrice !== undefined) params.set("prixMin", String(next.minPrice));
  if (next.maxPrice !== undefined) params.set("prixMax", String(next.maxPrice));
  if (next.sort !== "popularite") params.set("tri", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function activeFilterCount(f: CatalogFilters) {
  return (
    f.sizes.length +
    f.colors.length +
    f.brands.length +
    (f.minPrice !== undefined ? 1 : 0) +
    (f.maxPrice !== undefined ? 1 : 0)
  );
}

export function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

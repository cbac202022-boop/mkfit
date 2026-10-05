import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { CatalogFilters, SortKey } from "@/lib/catalog-params";

export const PAGE_SIZE = 12;

/** Données nécessaires pour afficher une carte produit. */
export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  brand: true,
  createdAt: true,
  images: { orderBy: { position: "asc" }, take: 2, select: { url: true, alt: true } },
  variants: { select: { color: true, colorHex: true, stock: true } },
  reviews: { select: { rating: true } },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

const ORDER_BY: Record<SortKey, Prisma.ProductOrderByWithRelationInput> = {
  popularite: { salesCount: "desc" },
  nouveautes: { createdAt: "desc" },
  "prix-asc": { price: "asc" },
  "prix-desc": { price: "desc" },
};

function baseWhere(f: Pick<CatalogFilters, "category" | "q">): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true };
  if (f.category) where.category = { slug: f.category };
  if (f.q) {
    where.OR = [
      { name: { contains: f.q } },
      { brand: { contains: f.q } },
      { description: { contains: f.q } },
      { category: { name: { contains: f.q } } },
    ];
  }
  return where;
}

export async function getCatalog(f: CatalogFilters) {
  const where: Prisma.ProductWhereInput = { ...baseWhere(f), AND: [] };
  const and = where.AND as Prisma.ProductWhereInput[];

  if (f.minPrice !== undefined) and.push({ price: { gte: Math.round(f.minPrice * 100) } });
  if (f.maxPrice !== undefined) and.push({ price: { lte: Math.round(f.maxPrice * 100) } });
  if (f.brands.length) and.push({ brand: { in: f.brands } });
  if (f.sizes.length || f.colors.length) {
    and.push({
      variants: {
        some: {
          ...(f.sizes.length ? { size: { in: f.sizes } } : {}),
          ...(f.colors.length ? { color: { in: f.colors } } : {}),
        },
      },
    });
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy: [ORDER_BY[f.sort], { id: "asc" }],
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return { products, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Valeurs disponibles pour les filtres, dans le périmètre courant (catégorie / recherche). */
export async function getFacets(f: Pick<CatalogFilters, "category" | "q">) {
  const where = baseWhere(f);
  const [brands, variants, priceRange] = await Promise.all([
    prisma.product.findMany({ where, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
    prisma.variant.findMany({
      where: { product: where },
      distinct: ["size", "color"],
      select: { size: true, color: true, colorHex: true },
    }),
    prisma.product.aggregate({ where, _min: { price: true }, _max: { price: true } }),
  ]);

  const sizes = sortSizes([...new Set(variants.map((v) => v.size))]);
  const colorMap = new Map<string, string>();
  for (const v of variants) colorMap.set(v.color, v.colorHex);
  const colors = [...colorMap.entries()]
    .map(([name, hex]) => ({ name, hex }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return {
    brands: brands.map((b) => b.brand),
    sizes,
    colors,
    minPrice: Math.floor((priceRange._min.price ?? 0) / 100),
    maxPrice: Math.ceil((priceRange._max.price ?? 0) / 100),
  };
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

/** Ordre d'affichage : tailles de vêtements, puis pointures, puis le reste (poids, contenances…). */
export function sortSizes(sizes: string[]) {
  const group = (s: string) => (SIZE_ORDER.includes(s) ? 0 : /^\d+$/.test(s) ? 1 : s === "Unique" ? 3 : 2);
  return [...sizes].sort((a, b) => {
    const ga = group(a);
    const gb = group(b);
    if (ga !== gb) return ga - gb;
    if (ga === 0) return SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b);
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
    return a.localeCompare(b, "fr");
  });
}

/** Identifiants des produits favoris de l'utilisateur connecté (vide si déconnecté). */
export async function getFavoriteIds(): Promise<Set<string>> {
  const session = await getSession();
  if (!session?.user) return new Set();
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return new Set(favorites.map((f) => f.productId));
}

export function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    select: productCardSelect,
    orderBy: { salesCount: "desc" },
    take,
  });
}

export function getNewProducts(take = 8) {
  return prisma.product.findMany({
    where: { active: true },
    select: productCardSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ color: "asc" }] },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export function getSimilarProducts(productId: string, categoryId: string, take = 4) {
  return prisma.product.findMany({
    where: { active: true, categoryId, id: { not: productId } },
    select: productCardSelect,
    orderBy: { salesCount: "desc" },
    take,
  });
}

export function getCategories() {
  return prisma.category.findMany({ orderBy: { position: "asc" } });
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/catalog-view";
import { parseFilters } from "@/lib/catalog-params";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ categorie: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categorie } = await params;
  const category = await prisma.category.findUnique({ where: { slug: categorie } });
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Découvrez notre sélection ${category.name} sur MKFit.`,
    alternates: { canonical: `/boutique/${category.slug}` },
    openGraph: category.image ? { images: [category.image] } : undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { categorie } = await params;
  const category = await prisma.category.findUnique({ where: { slug: categorie } });
  if (!category) notFound();

  const filters = parseFilters(await searchParams, category.slug);
  return (
    <CatalogView
      title={category.name}
      description={category.description}
      basePath={`/boutique/${category.slug}`}
      filters={filters}
      breadcrumbs={[{ label: "Boutique", href: "/boutique" }, { label: category.name }]}
      showCategories
    />
  );
}

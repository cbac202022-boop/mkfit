import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

// Généré à la demande : toujours à jour, et le build ne dépend pas de la base
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, createdAt: true } }),
    prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages = ["", "/boutique", "/a-propos", "/contact", "/faq", "/cgv", "/livraison-retours"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: `${base}/boutique/${c.slug}`,
      lastModified: c.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${base}/produit/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

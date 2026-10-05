import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/compte", "/panier", "/commande", "/api", "/recherche"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

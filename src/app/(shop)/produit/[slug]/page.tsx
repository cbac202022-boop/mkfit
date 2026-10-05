import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Badge, Breadcrumbs, Price, SectionHeader, Stars } from "@/components/ui/misc";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ReviewForm } from "@/components/product/review-form";
import { ProductGrid } from "@/components/product/product-card";
import { getFavoriteIds, getProductBySlug, getSimilarProducts, sortSizes } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import { siteConfig } from "@/lib/site";
import { averageRating, formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const description = product.description.slice(0, 155);
  return {
    title: product.brand === "MKFit" ? product.name : `${product.name} — ${product.brand}`,
    description,
    alternates: { canonical: `/produit/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.images.slice(0, 1).map((i) => ({ url: i.url, alt: i.alt })),
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [similar, favoriteIds, session] = await Promise.all([
    getSimilarProducts(product.id, product.categoryId),
    getFavoriteIds(),
    getSession(),
  ]);

  const rating = averageRating(product.reviews);
  const sizes = sortSizes([...new Set(product.variants.map((v) => v.size))]);
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const myReview = session?.user ? product.reviews.find((r) => r.userId === session.user.id) : undefined;
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  // Données structurées pour les moteurs de recherche
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.brand },
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.price / 100).toFixed(2),
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/produit/${product.slug}`,
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };

  return (
    <div className="container py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs
        items={[
          { label: "Boutique", href: "/boutique" },
          { label: product.category.name, href: `/boutique/${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} />

        <div>
          <p className="eyebrow text-ink-500">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {product.reviews.length > 0 ? (
              <a href="#avis" className="flex items-center gap-2 text-sm hover:underline">
                <Stars rating={rating} showValue />
                <span className="text-ink-500">({product.reviews.length} avis)</span>
              </a>
            ) : (
              <span className="text-sm text-ink-500">Aucun avis pour le moment</span>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Price price={product.price} compareAt={product.compareAtPrice} className="text-2xl" />
            {onSale && (
              <Badge>-{Math.round((1 - product.price / product.compareAtPrice!) * 100)} %</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-500">TVA incluse. Livraison offerte dès 60 €.</p>

          <div className="mt-8">
            <ProductPurchase
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0]?.url ?? "",
                sizeLabel: product.sizeLabel,
                colorLabel: product.colorLabel,
              }}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                colorHex: v.colorHex,
                stock: v.stock,
              }))}
              sizes={sizes}
            />
          </div>

          <FavoriteButton
            productId={product.id}
            productName={product.name}
            initial={favoriteIds.has(product.id)}
            withLabel
            className="mt-3 w-full"
          />

          <ul className="mt-8 space-y-3 border-y border-ink-200 py-6 text-sm">
            <li className="flex items-center gap-3">
              <Truck className="h-5 w-5" aria-hidden="true" /> Livraison standard offerte dès 60 €, express en 24-48 h
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5" aria-hidden="true" /> Retours gratuits sous 30 jours
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" /> Paiement 100 % sécurisé
            </li>
          </ul>

          <section className="mt-8" aria-labelledby="description-title">
            <h2 id="description-title" className="heading-md">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-600">{product.description}</p>
          </section>
        </div>
      </div>

      {/* Avis clients */}
      <section id="avis" className="mt-20 scroll-mt-32" aria-labelledby="avis-title">
        <h2 id="avis-title" className="heading-lg">
          Avis clients
        </h2>
        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
          <div>
            {product.reviews.length > 0 ? (
              <>
                <div className="mb-8 flex items-center gap-4">
                  <span className="font-display text-5xl font-black">{rating.toFixed(1).replace(".", ",")}</span>
                  <div>
                    <Stars rating={rating} size={20} />
                    <p className="text-sm text-ink-500">Basé sur {product.reviews.length} avis</p>
                  </div>
                </div>
                <ul className="divide-y divide-ink-200">
                  {product.reviews.map((r) => (
                    <li key={r.id} className="py-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Stars rating={r.rating} size={14} />
                        <p className="text-xs text-ink-500">
                          {r.user.name.split(" ")[0]} · <time dateTime={r.createdAt.toISOString()}>{formatDate(r.createdAt)}</time>
                        </p>
                      </div>
                      <h3 className="mt-2 font-sans font-bold">{r.title}</h3>
                      <p className="mt-1 text-ink-600">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-ink-500">Soyez le premier à donner votre avis sur ce produit.</p>
            )}
          </div>
          <div className="rounded-2xl bg-ink-100 p-6">
            <h3 className="heading-md mb-4">{myReview ? "Votre avis" : "Donner mon avis"}</h3>
            {session?.user ? (
              <ReviewForm productId={product.id} existing={myReview} />
            ) : (
              <p className="text-sm">
                <Link
                  href={`/compte/connexion?callbackUrl=/produit/${product.slug}`}
                  className="font-bold underline underline-offset-4"
                >
                  Connectez-vous
                </Link>{" "}
                pour partager votre expérience.
              </p>
            )}
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-20" aria-label="Produits similaires">
          <SectionHeader eyebrow="Vous aimerez aussi" title="Produits similaires" />
          <ProductGrid products={similar} favoriteIds={favoriteIds} />
        </section>
      )}
    </div>
  );
}

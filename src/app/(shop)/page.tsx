import Link from "next/link";
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/misc";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductGrid } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { getCategories, getFavoriteIds, getFeaturedProducts, getNewProducts } from "@/lib/catalog";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80";

const perks = [
  { icon: Truck, title: "Livraison offerte", text: "Dès 60 € d'achat en France métropolitaine" },
  { icon: RotateCcw, title: "Retours gratuits", text: "30 jours pour changer d'avis" },
  { icon: ShieldCheck, title: "Paiement sécurisé", text: "Carte bancaire via Stripe" },
];

export default async function HomePage() {
  const [categories, featured, newest, favoriteIds] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getNewProducts(4),
    getFavoriteIds(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="dark-surface relative isolate overflow-hidden bg-ink text-white">
        <SmartImage
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-50"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="container flex min-h-[70vh] flex-col justify-center py-20 sm:min-h-[80vh]">
          <p className="eyebrow mb-4 text-accent">Nouvelle collection automne 2026</p>
          <h1 className="heading-xl max-w-3xl">
            Repousse
            <br />
            tes <span className="text-accent">limites.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink-200">
            Vêtements techniques, chaussures, matériel de musculation et nutrition : tout ce qu&apos;il faut pour
            progresser, séance après séance.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/boutique" size="lg">
              Découvrir la boutique <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/boutique?tri=nouveautes" size="lg" variant="outline-light">
              Nouveautés
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Bandeau défilant */}
      <div className="dark-surface overflow-hidden border-y-2 border-ink bg-accent py-3 text-ink" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-lg font-black uppercase italic">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12">
              {["Train hard", "Livraison offerte dès 60 €", "Stay strong", "Retours gratuits 30 jours", "No excuses", "-20 % avec MKFIT20"].map(
                (t) => (
                  <span key={t}>{t} ✦</span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Catégories */}
      <section className="container py-20" aria-labelledby="categories-title">
        <div className="mb-8">
          <p className="eyebrow mb-2 text-ink-500">Explorer</p>
          <h2 id="categories-title" className="heading-lg">
            Nos catégories
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <li key={c.id} className={i === 0 ? "col-span-2 md:col-span-1" : ""}>
              <Link
                href={`/boutique/${c.slug}`}
                className={`group relative flex items-end overflow-hidden rounded-2xl bg-ink p-5 ${
                  i === 0 ? "aspect-[2/1] md:aspect-[4/5]" : "aspect-[4/5]"
                }`}
              >
                {c.image && (
                  <SmartImage
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
                <span className="relative flex w-full items-center justify-between font-display text-xl font-black uppercase text-white">
                  {c.name}
                  <ArrowRight
                    className="h-6 w-6 rounded-full bg-accent p-1 text-ink transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Produits en vedette */}
      <section className="container pb-20" aria-label="Produits en vedette">
        <SectionHeader
          eyebrow="Best-sellers"
          title="En vedette"
          action={
            <Link href="/boutique" className="hidden text-sm font-bold uppercase underline underline-offset-4 sm:block">
              Tout voir
            </Link>
          }
        />
        <ProductGrid products={featured} favoriteIds={favoriteIds} />
      </section>

      {/* Bandeau promo */}
      <section className="container pb-20" aria-label="Offre du moment">
        <div className="dark-surface relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-white sm:px-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent opacity-90 blur-0 sm:h-96 sm:w-96" aria-hidden="true" />
          <div className="relative max-w-xl">
            <p className="eyebrow text-accent">Offre limitée</p>
            <p className="heading-lg mt-3">-20 % dès 100 € d&apos;achat</p>
            <p className="mt-4 text-ink-200">
              Utilisez le code <strong className="rounded bg-white px-2 py-0.5 font-mono text-ink">MKFIT20</strong> dans
              votre panier. Valable sur toute la boutique, y compris les promotions.
            </p>
            <ButtonLink href="/boutique" className="mt-8" size="lg">
              J&apos;en profite
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      <section className="container pb-20" aria-label="Nouveautés">
        <SectionHeader
          eyebrow="Fraîchement arrivés"
          title="Nouveautés"
          action={
            <Link
              href="/boutique?tri=nouveautes"
              className="hidden text-sm font-bold uppercase underline underline-offset-4 sm:block"
            >
              Tout voir
            </Link>
          }
        />
        <ProductGrid products={newest} favoriteIds={favoriteIds} />
      </section>

      {/* Engagements */}
      <section className="border-y border-ink-200 bg-ink-100" aria-label="Nos engagements">
        <ul className="container grid gap-8 py-12 sm:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-ink text-accent">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-ink-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Newsletter */}
      <section className="container pt-20" aria-labelledby="newsletter-title">
        <div className="dark-surface flex flex-col items-start gap-8 rounded-3xl bg-ink px-6 py-14 text-white sm:px-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <h2 id="newsletter-title" className="heading-lg">
              Rejoins la team
            </h2>
            <p className="mt-3 text-ink-200">
              Conseils d&apos;entraînement, avant-premières et -10 % sur ta première commande avec le code{" "}
              <strong className="text-accent">BIENVENUE10</strong>.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

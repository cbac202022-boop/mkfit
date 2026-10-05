import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";
import { ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";

export const metadata: Metadata = {
  title: "À propos",
  description: "MKFit, c'est l'histoire de passionnés de sport qui veulent rendre l'équipement de qualité accessible à tous.",
  alternates: { canonical: "/a-propos" },
};

const values = [
  { title: "Performance", text: "Chaque produit est testé en conditions réelles par notre équipe d'athlètes avant d'arriver en boutique." },
  { title: "Durabilité", text: "Matières recyclées, emballages réduits et réparation encouragée : on préfère les produits qui durent." },
  { title: "Accessibilité", text: "Du débutant à l'athlète confirmé, des prix justes et des conseils honnêtes pour tous les niveaux." },
];

export default function AboutPage() {
  return (
    <StaticPage title="À propos de MKFit" intro="Né dans une salle de sport parisienne en 2021, MKFit équipe aujourd'hui des milliers de sportifs partout en France.">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="prose-mkfit">
          <p>
            Tout a commencé avec une frustration simple : trouver du matériel de qualité, au bon prix, sans se perdre dans des
            catalogues interminables. Nous avons donc créé la boutique que nous aurions voulu trouver.
          </p>
          <p>
            Aujourd&apos;hui, MKFit sélectionne et conçoit des vêtements techniques, des chaussures, du matériel de musculation et
            des compléments alimentaires pour vous accompagner à chaque étape : préparation, effort, récupération.
          </p>
          <p>
            Notre équipe basée à Paris répond à vos questions, prépare vos commandes avec soin et teste chaque nouveauté avant de la
            proposer.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink-100">
          <SmartImage
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
            alt="Un athlète s'entraîne dans une salle de sport"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <section className="mt-20" aria-labelledby="values-title">
        <h2 id="values-title" className="heading-lg mb-8">
          Nos valeurs
        </h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <li key={v.title} className="rounded-2xl bg-ink-100 p-8">
              <span className="font-display text-5xl font-black text-ink-300" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="heading-md mt-4">{v.title}</h3>
              <p className="mt-2 text-ink-600">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16">
        <ButtonLink href="/boutique" size="lg">
          Découvrir nos produits
        </ButtonLink>
      </div>
    </StaticPage>
  );
}

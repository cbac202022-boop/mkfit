import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes",
  description: "Livraison, retours, paiement, tailles : toutes les réponses à vos questions sur MKFit.",
  alternates: { canonical: "/faq" },
};

const sections = [
  {
    title: "Commandes et paiement",
    items: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Nous acceptons les cartes Visa, Mastercard et American Express, ainsi qu'Apple Pay et Google Pay. Les paiements sont traités de façon sécurisée par Stripe : nous n'avons jamais accès à vos données bancaires.",
      },
      {
        q: "Puis-je commander sans créer de compte ?",
        a: "Oui, la commande en invité est possible. Créer un compte vous permet toutefois de suivre vos commandes, d'enregistrer vos adresses et vos favoris.",
      },
      {
        q: "Comment utiliser un code promo ?",
        a: "Saisissez votre code dans le champ « Code promo » de votre panier puis cliquez sur « Appliquer ». La remise est immédiatement déduite du total.",
      },
    ],
  },
  {
    title: "Livraison",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Les commandes passées avant 14 h sont expédiées le jour même. Comptez 3 à 5 jours ouvrés en livraison standard ou en point relais, et 24 à 48 h en express.",
      },
      {
        q: "La livraison est-elle gratuite ?",
        a: "La livraison standard et en point relais est offerte dès 60 € d'achat (après remise). En dessous, elle coûte respectivement 4,90 € et 3,90 €. L'express est à 9,90 €.",
      },
    ],
  },
  {
    title: "Retours et échanges",
    items: [
      {
        q: "Puis-je retourner un article ?",
        a: "Oui, vous disposez de 30 jours après réception pour retourner gratuitement un article non porté, dans son emballage d'origine. Les produits de nutrition entamés ne sont ni repris ni échangés.",
      },
      {
        q: "Quand serai-je remboursé ?",
        a: "Le remboursement est effectué sous 5 jours ouvrés après réception et contrôle de votre retour, sur le moyen de paiement utilisé lors de la commande.",
      },
    ],
  },
  {
    title: "Produits",
    items: [
      {
        q: "Comment choisir ma taille ?",
        a: "Nos vêtements taillent normalement. En cas de doute entre deux tailles, prenez la plus grande pour les coupes « training » et la plus petite pour les leggings et brassières (effet compressif).",
      },
      {
        q: "Un produit est épuisé, sera-t-il réapprovisionné ?",
        a: "La plupart de nos références sont réassorties régulièrement. Ajoutez le produit à vos favoris pour le retrouver facilement, ou contactez-nous pour connaître la date de retour en stock.",
      },
    ],
  },
];

export default function FaqPage() {
  // Données structurées FAQ pour les moteurs de recherche
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((s) =>
      s.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  };

  return (
    <StaticPage title="Questions fréquentes" intro="Vous ne trouvez pas votre réponse ? Notre équipe est là pour vous aider.">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="max-w-3xl space-y-12">
        {sections.map((section) => (
          <section key={section.title} aria-labelledby={`faq-${section.title}`}>
            <h2 id={`faq-${section.title}`} className="heading-md mb-4">
              {section.title}
            </h2>
            <div className="divide-y divide-ink-200 border-y border-ink-200">
              {section.items.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="h-5 w-5 flex-none transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-600">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <p>
          Toujours une question ?{" "}
          <Link href="/contact" className="font-bold underline underline-offset-4">
            Contactez-nous
          </Link>
          .
        </p>
      </div>
    </StaticPage>
  );
}

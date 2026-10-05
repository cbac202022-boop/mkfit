import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/layout/static-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente de la boutique en ligne MKFit.",
  alternates: { canonical: "/cgv" },
};

export default function CgvPage() {
  return (
    <StaticPage title="Conditions générales de vente" intro="En vigueur au 1er octobre 2026.">
      <div className="prose-mkfit">
        <p>
          <em>
            Modèle fourni à titre indicatif. Faites valider vos CGV par un professionnel du droit avant la mise en ligne.
          </em>
        </p>

        <h2>Article 1 — Objet</h2>
        <p>
          Les présentes conditions régissent les ventes de produits effectuées sur le site MKFit, édité par la société MKFit SAS,
          dont le siège social est situé {siteConfig.address}. Toute commande implique l&apos;acceptation sans réserve des présentes
          conditions.
        </p>

        <h2>Article 2 — Prix</h2>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises (TVA française applicable). Les frais de livraison sont indiqués
          avant la validation de la commande. MKFit se réserve le droit de modifier ses prix à tout moment ; les produits sont
          facturés au prix en vigueur lors de l&apos;enregistrement de la commande.
        </p>

        <h2>Article 3 — Commande</h2>
        <p>
          Le client sélectionne les produits, les ajoute à son panier, renseigne ses coordonnées de livraison, choisit un mode de
          livraison puis procède au paiement. La vente est conclue à la confirmation du paiement. Un récapitulatif de la commande
          est alors affiché et reste consultable depuis l&apos;espace client.
        </p>

        <h2>Article 4 — Paiement</h2>
        <p>
          Le paiement s&apos;effectue par carte bancaire via la plateforme sécurisée Stripe. Les données bancaires ne transitent
          jamais par les serveurs de MKFit.
        </p>

        <h2>Article 5 — Livraison</h2>
        <p>
          Les produits sont livrés à l&apos;adresse indiquée lors de la commande, en France métropolitaine. Les délais et tarifs
          sont détaillés sur la page <Link href="/livraison-retours">Livraison &amp; retours</Link>.
        </p>

        <h2>Article 6 — Droit de rétractation</h2>
        <p>
          Conformément aux articles L221-18 et suivants du Code de la consommation, le client dispose d&apos;un délai de 14 jours à
          compter de la réception pour exercer son droit de rétractation, sans avoir à se justifier. MKFit étend volontairement ce
          délai à 30 jours. Les compléments alimentaires descellés après livraison sont exclus du droit de rétractation pour des
          raisons d&apos;hygiène.
        </p>

        <h2>Article 7 — Garanties</h2>
        <p>
          Les produits bénéficient de la garantie légale de conformité (articles L217-3 et suivants du Code de la consommation) et
          de la garantie contre les vices cachés (articles 1641 et suivants du Code civil).
        </p>

        <h2>Article 8 — Données personnelles</h2>
        <p>
          Les données collectées sont nécessaires au traitement des commandes. Conformément au RGPD, le client dispose d&apos;un
          droit d&apos;accès, de rectification et de suppression de ses données en écrivant à{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
        </p>

        <h2>Article 9 — Litiges</h2>
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, le client peut recourir gratuitement à un
          médiateur de la consommation avant toute action judiciaire.
        </p>
      </div>
    </StaticPage>
  );
}

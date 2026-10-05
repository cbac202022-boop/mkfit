import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/layout/static-page";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description: "Délais, tarifs de livraison et politique de retour gratuite sous 30 jours chez MKFit.",
  alternates: { canonical: "/livraison-retours" },
};

export default function ShippingPage() {
  return (
    <StaticPage title="Livraison & retours" intro={`Livraison offerte dès ${formatPrice(FREE_SHIPPING_THRESHOLD)} et retours gratuits sous 30 jours.`}>
      <section aria-labelledby="shipping-title" className="max-w-3xl">
        <h2 id="shipping-title" className="heading-md mb-4">
          Modes de livraison
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-ink-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-100">
              <tr>
                <th scope="col" className="px-4 py-3">Mode</th>
                <th scope="col" className="px-4 py-3">Délai</th>
                <th scope="col" className="px-4 py-3">Tarif</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SHIPPING_METHODS).map((m) => (
                <tr key={m.label} className="border-t border-ink-200">
                  <td className="px-4 py-3 font-semibold">{m.label}</td>
                  <td className="px-4 py-3">{m.description}</td>
                  <td className="px-4 py-3">
                    {formatPrice(m.price)}
                    {m.freeAboveThreshold && (
                      <span className="text-ink-500"> · offert dès {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="prose-mkfit mt-12">
        <h2>Expédition</h2>
        <p>
          Les commandes passées avant 14 h (du lundi au vendredi) sont préparées et expédiées le jour même depuis notre entrepôt.
          Vous pouvez suivre l&apos;état de votre commande depuis votre <Link href="/compte">espace client</Link>.
        </p>

        <h2>Retours gratuits sous 30 jours</h2>
        <ul>
          <li>Les articles doivent être non portés, non lavés et dans leur emballage d&apos;origine.</li>
          <li>Les compléments alimentaires doivent être scellés.</li>
          <li>Le retour est gratuit en point relais : contactez-nous pour recevoir votre étiquette prépayée.</li>
        </ul>

        <h2>Remboursement</h2>
        <p>
          Nous remboursons sous 5 jours ouvrés après réception et vérification du colis, sur le moyen de paiement utilisé. Les
          frais de livraison initiaux sont remboursés en cas de retour de la totalité de la commande.
        </p>

        <h2>Échanges</h2>
        <p>
          Pour échanger une taille ou une couleur, effectuez un retour puis passez une nouvelle commande : c&apos;est la solution la
          plus rapide pour être sûr d&apos;obtenir l&apos;article souhaité. Une question ? <Link href="/contact">Contactez-nous</Link>.
        </p>
      </div>
    </StaticPage>
  );
}

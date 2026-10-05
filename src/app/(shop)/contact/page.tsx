import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { StaticPage } from "@/components/layout/static-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur un produit ou une commande ? Contactez le service client MKFit.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const infos = [
    { icon: Mail, label: "Email", value: <a href={`mailto:${siteConfig.email}`} className="underline">{siteConfig.email}</a> },
    { icon: Phone, label: "Téléphone", value: siteConfig.phone },
    { icon: MapPin, label: "Adresse", value: siteConfig.address },
    { icon: Clock, label: "Horaires", value: "Du lundi au vendredi, 9 h – 18 h" },
  ];

  return (
    <StaticPage title="Contact" intro="Notre équipe vous répond sous 48 h ouvrées.">
      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <ContactForm />
        <aside className="space-y-6 rounded-2xl bg-ink-100 p-8">
          <ul className="space-y-5">
            {infos.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex gap-4">
                <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-sm text-ink-600">{value}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-ink-300 pt-6 text-sm">
            Consultez aussi notre <Link href="/faq" className="font-bold underline">FAQ</Link> : la réponse à votre question y est peut-être déjà.
          </p>
        </aside>
      </div>
    </StaticPage>
  );
}

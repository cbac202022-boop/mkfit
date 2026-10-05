import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { mainNav, siteConfig } from "@/lib/site";

const columns = [
  { title: "Boutique", links: [{ label: "Tous les produits", href: "/boutique" }, ...mainNav] },
  {
    title: "Aide",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Livraison & retours", href: "/livraison-retours" },
      { label: "Contact", href: "/contact" },
      { label: "Mon compte", href: "/compte" },
    ],
  },
  {
    title: "MKFit",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Conditions générales de vente", href: "/cgv" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="dark-surface mt-24 bg-ink text-ink-300">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            L&apos;équipement des sportifs exigeants. Conçu pour performer, pensé pour durer.
          </p>
          <address className="mt-6 space-y-1 text-sm not-italic">
            <p>{siteConfig.address}</p>
            <p>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-accent">
                {siteConfig.email}
              </a>
            </p>
            <p>{siteConfig.phone}</p>
          </address>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="eyebrow mb-4 font-sans text-white">{col.title}</h2>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ink-700">
        <div className="container flex flex-col gap-2 py-6 text-xs sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} MKFit. Tous droits réservés.</p>
          <p>Paiement sécurisé · Prix TTC en euros</p>
        </div>
      </div>
    </footer>
  );
}

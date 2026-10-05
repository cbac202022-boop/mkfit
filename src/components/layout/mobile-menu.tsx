"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { mainNav } from "@/lib/site";

const secondary = [
  { label: "Tous les produits", href: "/boutique" },
  { label: "Mon compte", href: "/compte" },
  { label: "Mes favoris", href: "/compte/favoris" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Ferme le menu à chaque changement de page
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-100"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-menu">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="dark-surface absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-ink p-6 text-white">
            <div className="flex items-center justify-between">
              <Logo light />
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-700"
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Menu mobile" className="mt-10">
              <ul className="space-y-1">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block py-2 font-display text-3xl font-black uppercase hover:text-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-8 space-y-3 border-t border-ink-700 pt-8">
                {secondary.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-ink-200 hover:text-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

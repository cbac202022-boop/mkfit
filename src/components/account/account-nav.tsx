"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Heart, LogOut, MapPin, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/compte", label: "Mes commandes", icon: Package },
  { href: "/compte/adresses", label: "Mes adresses", icon: MapPin },
  { href: "/compte/favoris", label: "Mes favoris", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Espace client">
      <ul className="scrollbar-none flex gap-2 overflow-x-auto lg:flex-col">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/compte" ? pathname === "/compte" || pathname.startsWith("/compte/commandes") : pathname.startsWith(href);
          return (
            <li key={href} className="flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold",
                  active ? "bg-ink text-white" : "hover:bg-ink-100",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="flex-none">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-500 hover:bg-ink-100 hover:text-ink"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Déconnexion
          </button>
        </li>
      </ul>
    </nav>
  );
}

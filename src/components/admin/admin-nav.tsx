"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, FolderTree, LayoutDashboard, Package, ShoppingCart, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/stocks", label: "Stocks", icon: Boxes },
  { href: "/admin/categories", label: "Catégories", icon: FolderTree },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="flex-1">
      <ul className="scrollbar-none flex gap-1 overflow-x-auto lg:flex-col">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold",
                  active ? "bg-accent text-ink" : "text-ink-200 hover:bg-ink-700 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="flex-none lg:mt-6">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink-300 hover:text-white">
            <Store className="h-4 w-4" aria-hidden="true" />
            Voir la boutique
          </Link>
        </li>
      </ul>
    </nav>
  );
}

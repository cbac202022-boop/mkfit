"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, LayoutDashboard, ShoppingBag, User } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

const iconLink = "relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-100";

export function HeaderActions() {
  const { data: session } = useSession();
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  return (
    <div className="ml-auto flex items-center gap-1 md:ml-0">
      {session?.user.role === "ADMIN" && (
        <Link href="/admin" className={iconLink} aria-label="Espace administrateur">
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
        </Link>
      )}
      <Link
        href="/compte"
        className={iconLink}
        aria-label={session?.user ? `Mon compte (${session.user.name})` : "Se connecter"}
      >
        <User className="h-5 w-5" aria-hidden="true" />
        {session?.user && (
          <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" aria-hidden="true" />
        )}
      </Link>
      <Link href="/compte/favoris" className={`${iconLink} hidden sm:inline-flex`} aria-label="Mes favoris">
        <Heart className="h-5 w-5" aria-hidden="true" />
      </Link>
      <Link href="/panier" className={iconLink} aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}>
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        {count > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-ink ring-2 ring-white"
            aria-hidden="true"
          >
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}

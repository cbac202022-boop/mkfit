import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SearchBar } from "@/components/layout/search-bar";
import { HeaderActions } from "@/components/layout/header-actions";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { mainNav } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="dark-surface bg-ink py-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
        Livraison offerte dès 60 € · Retours gratuits sous 30 jours
      </div>
      <div className="container flex h-16 items-center gap-4 lg:gap-8">
        <MobileMenu />
        <Logo />
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-bold uppercase tracking-wide underline-offset-8 hover:underline hover:decoration-accent hover:decoration-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto hidden max-w-sm flex-1 md:block">
          <SearchBar />
        </div>
        <HeaderActions />
      </div>
      <div className="container pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}

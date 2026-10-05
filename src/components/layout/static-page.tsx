import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/misc";

/** Gabarit commun des pages éditoriales (À propos, CGV, FAQ…). */
export function StaticPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: title }]} />
      <header className="mb-10 mt-6 max-w-3xl">
        <h1 className="heading-lg">{title}</h1>
        {intro && <p className="mt-3 text-lg text-ink-500">{intro}</p>}
      </header>
      {children}
    </div>
  );
}

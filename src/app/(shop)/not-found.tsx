import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <p className="font-display text-8xl font-black text-ink-200" aria-hidden="true">
        404
      </p>
      <h1 className="heading-lg mt-4">Page introuvable</h1>
      <p className="mt-3 max-w-md text-ink-500">
        Cette page a peut-être été déplacée, ou le produit n&apos;est plus disponible.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/">Accueil</ButtonLink>
        <ButtonLink href="/boutique" variant="outline">
          Voir la boutique
        </ButtonLink>
      </div>
    </div>
  );
}

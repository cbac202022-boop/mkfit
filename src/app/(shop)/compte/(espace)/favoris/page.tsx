import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { ProductGrid } from "@/components/product/product-card";
import { requireUser } from "@/lib/auth";
import { productCardSelect } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const user = await requireUser("/compte/favoris");
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id, product: { active: true } },
    orderBy: { createdAt: "desc" },
    select: { product: { select: productCardSelect } },
  });
  const products = favorites.map((f) => f.product);

  return (
    <section aria-labelledby="favorites-title">
      <h2 id="favorites-title" className="heading-md mb-6">
        Mes favoris ({products.length})
      </h2>
      {products.length === 0 ? (
        <EmptyState title="Aucun favori" action={<ButtonLink href="/boutique">Parcourir la boutique</ButtonLink>}>
          Cliquez sur le cœur d&apos;un produit pour le retrouver ici.
        </EmptyState>
      ) : (
        <ProductGrid products={products} favoriteIds={new Set(products.map((p) => p.id))} />
      )}
    </section>
  );
}

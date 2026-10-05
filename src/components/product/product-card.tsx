import Link from "next/link";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge, Price, Stars } from "@/components/ui/misc";
import { FavoriteButton } from "@/components/product/favorite-button";
import type { ProductCardData } from "@/lib/catalog";
import { averageRating } from "@/lib/utils";

const NEW_DAYS = 14;

export function ProductCard({
  product,
  isFavorite = false,
  priority = false,
}: {
  product: ProductCardData;
  isFavorite?: boolean;
  priority?: boolean;
}) {
  const [main, hover] = product.images;
  const colors = [...new Map(product.variants.map((v) => [v.color, v.colorHex])).entries()];
  const inStock = product.variants.some((v) => v.stock > 0);
  const isNew = Date.now() - new Date(product.createdAt).getTime() < NEW_DAYS * 86_400_000;
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const rating = averageRating(product.reviews);

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-100">
        {main && (
          <SmartImage
            src={main.url}
            alt={main.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {hover && (
          <SmartImage
            src={hover.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {onSale && <Badge>Promo</Badge>}
          {isNew && <Badge tone="light">Nouveau</Badge>}
          {!inStock && <Badge tone="dark">Épuisé</Badge>}
        </div>
        <FavoriteButton
          productId={product.id}
          productName={product.name}
          initial={isFavorite}
          className="absolute right-3 top-3 z-10"
        />
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{product.brand}</p>
        <h3 className="font-sans text-sm font-semibold leading-snug sm:text-base">
          <Link href={`/produit/${product.slug}`} className="after:absolute after:inset-0 focus-visible:underline">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center justify-between gap-2">
          <Price price={product.price} compareAt={product.compareAtPrice} />
          {product.reviews.length > 0 && <Stars rating={rating} size={12} />}
        </div>
        {colors.length > 1 && (
          <p className="flex items-center gap-1 pt-1">
            <span className="sr-only">{colors.length} coloris disponibles</span>
            {colors.slice(0, 5).map(([name, hex]) => (
              <span
                key={name}
                title={name}
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full border border-ink-300"
                style={{ backgroundColor: hex }}
              />
            ))}
          </p>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  favoriteIds,
  priorityCount = 0,
}: {
  products: ProductCardData[];
  favoriteIds: Set<string>;
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} isFavorite={favoriteIds.has(p.id)} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

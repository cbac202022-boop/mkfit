"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, MAX_PER_ITEM } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

type Variant = { id: string; size: string; color: string; colorHex: string; stock: number };

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    sizeLabel: string;
    colorLabel: string;
  };
  variants: Variant[];
  sizes: string[]; // déjà triées
};

export function ProductPurchase({ product, variants, sizes }: Props) {
  const colors = useMemo(
    () => [...new Map(variants.map((v) => [v.color, v.colorHex])).entries()].map(([name, hex]) => ({ name, hex })),
    [variants],
  );
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [color, setColor] = useState(firstAvailable?.color ?? "");
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = useCart((s) => s.add);

  const variant = variants.find((v) => v.color === color && v.size === size);
  const stockFor = (s: string) => variants.find((v) => v.color === color && v.size === s)?.stock ?? 0;
  const max = Math.min(variant?.stock ?? 1, MAX_PER_ITEM);

  function onAdd() {
    if (!size) return setError(`Veuillez choisir : ${product.sizeLabel.toLowerCase()}.`);
    if (!variant || variant.stock === 0) return setError("Cette déclinaison est épuisée.");
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        size: variant.size,
        color: variant.color,
        sizeLabel: product.sizeLabel,
        colorLabel: product.colorLabel,
        price: product.price,
        maxStock: variant.stock,
      },
      quantity,
    );
    setError(null);
    setAdded(true);
    setTimeout(() => setAdded(false), 4000);
  }

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">
            {product.colorLabel} : <span className="font-normal">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <label key={c.name} className="cursor-pointer" title={c.name}>
                <input
                  type="radio"
                  name="color"
                  value={c.name}
                  checked={color === c.name}
                  onChange={() => {
                    setColor(c.name);
                    setQuantity(1);
                  }}
                  className="peer sr-only"
                />
                <span className="sr-only">{c.name}</span>
                <span
                  aria-hidden="true"
                  className="block h-10 w-10 rounded-full border border-ink-300 ring-offset-2 peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent-dark"
                  style={{ backgroundColor: c.hex }}
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">
            {product.sizeLabel}
            {size && <span className="font-normal"> : {size}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const out = stockFor(s) === 0;
              return (
                <label key={s} className={cn(out ? "cursor-not-allowed" : "cursor-pointer")}>
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={size === s}
                    disabled={out}
                    onChange={() => {
                      setSize(s);
                      setQuantity(1);
                      setError(null);
                    }}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-11 min-w-14 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors",
                      "peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2",
                      out ? "border-ink-200 text-ink-300 line-through" : "border-ink-300 hover:border-ink",
                    )}
                  >
                    {s}
                    {out && <span className="sr-only"> (épuisé)</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="text-sm" role="status" aria-live="polite">
        {variant ? (
          variant.stock === 0 ? (
            <span className="font-semibold text-red-700">Épuisé</span>
          ) : variant.stock <= 5 ? (
            <span className="font-semibold text-amber-800">Plus que {variant.stock} en stock — commandez vite !</span>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-600" aria-hidden="true" /> En stock, expédié sous 24 h
            </span>
          )
        ) : (
          <span className="text-ink-500">Sélectionnez une {product.sizeLabel.toLowerCase()} pour voir la disponibilité.</span>
        )}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-14 items-center rounded-full border-2 border-ink-200" role="group" aria-label="Quantité">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="flex h-full w-12 items-center justify-center disabled:text-ink-300"
            aria-label="Diminuer la quantité"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center font-bold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            disabled={quantity >= max}
            className="flex h-full w-12 items-center justify-center disabled:text-ink-300"
            aria-label="Augmenter la quantité"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <Button size="lg" className="flex-1" onClick={onAdd} disabled={variant?.stock === 0}>
          {added ? (
            <>
              <Check className="h-5 w-5" aria-hidden="true" /> Ajouté !
            </>
          ) : (
            "Ajouter au panier"
          )}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      {added && (
        <p role="status" className="flex items-center justify-between rounded-xl bg-ink-100 px-4 py-3 text-sm">
          <span>Produit ajouté à votre panier.</span>
          <Link href="/panier" className="font-bold underline underline-offset-4">
            Voir le panier
          </Link>
        </p>
      )}
    </div>
  );
}

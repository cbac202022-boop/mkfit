"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { getCartSnapshots } from "@/actions/cart";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { SmartImage } from "@/components/ui/smart-image";
import { PromoCodeForm } from "@/components/cart/promo-code-form";
import { cartSubtotal, MAX_PER_ITEM, useCart } from "@/lib/cart-store";
import { FREE_SHIPPING_THRESHOLD, promoDiscount } from "@/lib/pricing";
import { useHydrated } from "@/lib/use-hydrated";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const hydrated = useHydrated();
  const { items, promo, setQuantity, remove, sync } = useCart();
  const synced = useRef(false);

  // Au chargement : resynchronise prix et stocks avec la base
  useEffect(() => {
    if (!hydrated || synced.current || items.length === 0) return;
    synced.current = true;
    getCartSnapshots(items.map((i) => i.variantId)).then(sync).catch(() => {});
  }, [hydrated, items, sync]);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-ink-100" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState title="Votre panier est vide" action={<ButtonLink href="/boutique">Découvrir la boutique</ButtonLink>}>
        Parcourez nos nouveautés et trouvez l&apos;équipement qui vous fera progresser.
      </EmptyState>
    );
  }

  const subtotal = cartSubtotal(items);
  const promoResult = promoDiscount(promo, subtotal);
  const discount = promoResult?.valid ? promoResult.discount : 0;
  const afterDiscount = subtotal - discount;
  const remainingForFree = FREE_SHIPPING_THRESHOLD - afterDiscount;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section aria-label="Articles du panier">
        <ul className="divide-y divide-ink-200 border-y border-ink-200">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-6">
              <Link
                href={`/produit/${item.slug}`}
                className="relative h-32 w-24 flex-none overflow-hidden rounded-xl bg-ink-100 sm:h-36 sm:w-28"
                tabIndex={-1}
                aria-hidden="true"
              >
                {item.image && <SmartImage src={item.image} alt="" fill sizes="112px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-sans font-bold">
                      <Link href={`/produit/${item.slug}`} className="hover:underline">
                        {item.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-ink-500">
                      {item.colorLabel} : {item.color}
                      {item.size !== "Unique" && ` · ${item.sizeLabel} : ${item.size}`}
                    </p>
                    <p className="mt-1 text-sm">{formatPrice(item.price)}</p>
                  </div>
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex h-10 items-center rounded-full border border-ink-300" role="group" aria-label={`Quantité pour ${item.name}`}>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex h-full w-10 items-center justify-center disabled:text-ink-300"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= Math.min(item.maxStock, MAX_PER_ITEM)}
                      className="flex h-full w-10 items-center justify-center disabled:text-ink-300"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.variantId)}
                    className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Supprimer<span className="sr-only"> {item.name}</span>
                  </button>
                </div>
                {item.quantity >= item.maxStock && (
                  <p className="mt-2 text-xs font-medium text-amber-800">Quantité maximale disponible atteinte.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="h-fit space-y-6 rounded-2xl bg-ink-100 p-6 lg:sticky lg:top-32" aria-labelledby="summary-title">
        <h2 id="summary-title" className="heading-md">
          Récapitulatif
        </h2>

        {remainingForFree > 0 ? (
          <div>
            <p className="text-sm">
              Plus que <strong>{formatPrice(remainingForFree)}</strong> pour la livraison offerte.
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
              <div className="h-full bg-ink" style={{ width: `${Math.min(100, (afterDiscount / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-accent px-3 py-2 text-sm font-bold text-ink">Livraison standard offerte !</p>
        )}

        <PromoCodeForm />
        {promoResult && !promoResult.valid && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {promoResult.error}
          </p>
        )}

        <dl className="space-y-2 border-t border-ink-300 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between font-semibold text-green-800">
              <dt>Remise ({promo?.code})</dt>
              <dd>-{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-ink-500">
            <dt>Livraison</dt>
            <dd>Calculée à l&apos;étape suivante</dd>
          </div>
          <div className="flex justify-between border-t border-ink-300 pt-3 text-base font-bold">
            <dt>Total estimé</dt>
            <dd>{formatPrice(afterDiscount)}</dd>
          </div>
        </dl>

        <ButtonLink href="/commande" size="lg" className="w-full">
          Passer commande
        </ButtonLink>
        <Link href="/boutique" className="block text-center text-sm font-semibold underline underline-offset-4">
          Continuer mes achats
        </Link>
      </aside>
    </div>
  );
}

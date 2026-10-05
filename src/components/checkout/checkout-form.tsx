"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { AddressFields, type AddressValues } from "@/components/account/address-fields";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, TextField } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { SmartImage } from "@/components/ui/smart-image";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { promoDiscount, shippingCost, SHIPPING_METHODS, type ShippingMethod } from "@/lib/pricing";
import { useHydrated } from "@/lib/use-hydrated";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  email?: string;
  isLoggedIn: boolean;
  savedAddresses: (AddressValues & { id: string; isDefault: boolean })[];
  stripeEnabled: boolean;
  cancelled: boolean;
};

export function CheckoutForm({ email, isLoggedIn, savedAddresses, stripeEnabled, cancelled }: Props) {
  const hydrated = useHydrated();
  const { items, promo } = useCart();
  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const [addressId, setAddressId] = useState<string>(defaultAddress?.id ?? "new");
  const [method, setMethod] = useState<ShippingMethod>("STANDARD");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-ink-100" aria-hidden="true" />;

  if (items.length === 0) {
    return (
      <EmptyState title="Votre panier est vide" action={<ButtonLink href="/boutique">Voir la boutique</ButtonLink>}>
        Ajoutez des articles avant de passer commande.
      </EmptyState>
    );
  }

  const subtotal = cartSubtotal(items);
  const promoResult = promoDiscount(promo, subtotal);
  const discount = promoResult?.valid ? promoResult.discount : 0;
  const shipping = shippingCost(method, subtotal - discount);
  const total = subtotal - discount + shipping;
  const selected = savedAddresses.find((a) => a.id === addressId);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "");

    const address = selected
      ? {
          fullName: selected.fullName ?? "",
          line1: selected.line1 ?? "",
          line2: selected.line2 ?? "",
          postalCode: selected.postalCode ?? "",
          city: selected.city ?? "",
          country: selected.country ?? "France",
          phone: selected.phone ?? "",
        }
      : {
          fullName: get("fullName"),
          line1: get("line1"),
          line2: get("line2"),
          postalCode: get("postalCode"),
          city: get("city"),
          country: get("country"),
          phone: get("phone"),
        };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: get("email"),
          address,
          shippingMethod: method,
          promoCode: promoResult?.valid ? promo?.code : undefined,
          saveAddress: !selected && fd.get("saveAddress") === "on",
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; errors?: Record<string, string> };
      if (!res.ok || !data.url) {
        setErrors(data.errors ?? {});
        setError(data.error ?? "Une erreur est survenue.");
        setPending(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-10">
        {cancelled && <Alert>Paiement annulé. Votre panier a été conservé, vous pouvez réessayer.</Alert>}
        {error && <Alert tone="error">{error}</Alert>}

        <section aria-labelledby="contact-title">
          <h2 id="contact-title" className="heading-md mb-4">
            1. Contact
          </h2>
          <TextField
            label="Adresse email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={email}
            required
            error={errors.email}
            hint="Pour recevoir la confirmation et le suivi de commande."
          />
          {!isLoggedIn && (
            <p className="mt-3 text-sm text-ink-500">
              Déjà client ?{" "}
              <Link href="/compte/connexion?callbackUrl=/commande" className="font-semibold text-ink underline">
                Connectez-vous
              </Link>{" "}
              pour retrouver vos adresses.
            </p>
          )}
        </section>

        <section aria-labelledby="address-title">
          <h2 id="address-title" className="heading-md mb-4">
            2. Adresse de livraison
          </h2>
          {savedAddresses.length > 0 && (
            <fieldset className="mb-6 space-y-2">
              <legend className="sr-only">Choisir une adresse enregistrée</legend>
              {savedAddresses.map((a) => (
                <label
                  key={a.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border-2 p-4 text-sm",
                    addressId === a.id ? "border-ink" : "border-ink-200",
                  )}
                >
                  <input
                    type="radio"
                    name="addressChoice"
                    checked={addressId === a.id}
                    onChange={() => setAddressId(a.id)}
                    className="mt-0.5 text-ink focus:ring-ink"
                  />
                  <span>
                    <strong>{a.fullName}</strong> — {a.line1}, {a.postalCode} {a.city}
                  </span>
                </label>
              ))}
              <label
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border-2 p-4 text-sm",
                  addressId === "new" ? "border-ink" : "border-ink-200",
                )}
              >
                <input
                  type="radio"
                  name="addressChoice"
                  checked={addressId === "new"}
                  onChange={() => setAddressId("new")}
                  className="mt-0.5 text-ink focus:ring-ink"
                />
                <span className="font-semibold">Utiliser une nouvelle adresse</span>
              </label>
            </fieldset>
          )}
          {!selected && (
            <>
              <AddressFields errors={errors} prefix="address." />
              {isLoggedIn && (
                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input type="checkbox" name="saveAddress" className="h-4 w-4 rounded border-ink-300 text-ink focus:ring-ink" />
                  Enregistrer cette adresse dans mon compte
                </label>
              )}
            </>
          )}
        </section>

        <section aria-labelledby="shipping-title">
          <h2 id="shipping-title" className="heading-md mb-4">
            3. Mode de livraison
          </h2>
          <fieldset className="space-y-2">
            <legend className="sr-only">Mode de livraison</legend>
            {(Object.keys(SHIPPING_METHODS) as ShippingMethod[]).map((key) => {
              const m = SHIPPING_METHODS[key];
              const cost = shippingCost(key, subtotal - discount);
              return (
                <label
                  key={key}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4",
                    method === key ? "border-ink" : "border-ink-200",
                  )}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={key}
                    checked={method === key}
                    onChange={() => setMethod(key)}
                    className="text-ink focus:ring-ink"
                  />
                  <span className="flex-1">
                    <span className="block font-semibold">{m.label}</span>
                    <span className="block text-sm text-ink-500">{m.description}</span>
                  </span>
                  <span className="font-bold">{cost === 0 ? "Offerte" : formatPrice(cost)}</span>
                </label>
              );
            })}
          </fieldset>
        </section>
      </div>

      <aside className="h-fit space-y-6 rounded-2xl bg-ink-100 p-6 lg:sticky lg:top-32" aria-labelledby="checkout-summary">
        <h2 id="checkout-summary" className="heading-md">
          Votre commande
        </h2>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-3">
              <div className="relative h-16 w-14 flex-none overflow-hidden rounded-lg bg-white">
                {item.image && <SmartImage src={item.image} alt="" fill sizes="56px" className="object-cover" />}
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="text-ink-500">
                  {item.color}
                  {item.size !== "Unique" && ` · ${item.size}`}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
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
          <div className="flex justify-between">
            <dt>Livraison</dt>
            <dd>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink-300 pt-3 text-lg font-bold">
            <dt>Total TTC</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          <Lock className="h-4 w-4" aria-hidden="true" />
          {pending ? "Redirection…" : stripeEnabled ? "Payer avec Stripe" : "Valider la commande"}
        </Button>
        {stripeEnabled ? (
          <p className="text-center text-xs text-ink-500">
            Vous allez être redirigé vers la page de paiement sécurisée Stripe. Carte de test : 4242 4242 4242 4242.
          </p>
        ) : (
          <p className="rounded-lg border border-dashed border-ink-400 p-3 text-center text-xs text-ink-600">
            <strong>Mode démo</strong> : aucune clé Stripe configurée, le paiement est simulé.
          </p>
        )}
        <p className="text-center text-xs text-ink-500">
          En validant, vous acceptez nos{" "}
          <Link href="/cgv" className="underline">
            conditions générales de vente
          </Link>
          .
        </p>
      </aside>
    </form>
  );
}

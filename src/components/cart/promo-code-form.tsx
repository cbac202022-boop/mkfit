"use client";

import { useState, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { validatePromoCode } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { cartSubtotal, useCart } from "@/lib/cart-store";

export function PromoCodeForm() {
  const { items, promo, setPromo } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (promo) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-accent/30 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <Tag className="h-4 w-4" aria-hidden="true" /> Code <span className="font-mono">{promo.code}</span> appliqué
        </span>
        <button
          type="button"
          onClick={() => setPromo(null)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white"
          aria-label={`Retirer le code ${promo.code}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await validatePromoCode(code, cartSubtotal(items));
      if (result.ok) {
        setPromo(result.promo);
        setCode("");
        setError(null);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="promo" className="mb-1.5 block text-sm font-semibold">
        Code promo
      </label>
      <div className="flex gap-2">
        <input
          id="promo"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex. BIENVENUE10"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "promo-error" : undefined}
          className="h-11 flex-1 rounded-lg border-ink-300 font-mono text-sm uppercase focus:border-ink focus:ring-ink"
        />
        <Button type="submit" variant="dark" disabled={pending || !code.trim()}>
          {pending ? "…" : "Appliquer"}
        </Button>
      </div>
      {error && (
        <p id="promo-error" role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

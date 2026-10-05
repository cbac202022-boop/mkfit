"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateStock } from "@/actions/admin";

/** Modification du stock d'une variante directement dans le tableau. */
export function StockInput({ variantId, initial, label }: { variantId: string; initial: number; label: string }) {
  const [value, setValue] = useState(String(initial));
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState(false);
  const dirty = Number(value) !== saved;

  function save() {
    const stock = Number(value);
    if (!Number.isInteger(stock) || stock < 0) return setValue(String(saved));
    startTransition(async () => {
      const res = await updateStock(variantId, stock);
      if (res.ok) {
        setSaved(stock);
        setFlash(true);
        setTimeout(() => setFlash(false), 1500);
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex items-center justify-end gap-2"
    >
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={label}
        className={`h-9 w-20 rounded-lg text-right text-sm focus:border-ink focus:ring-ink ${
          saved === 0 ? "border-red-400" : saved <= 5 ? "border-amber-400" : "border-ink-300"
        }`}
      />
      <button
        type="submit"
        disabled={!dirty || pending}
        className="h-9 rounded-lg bg-ink px-3 text-xs font-semibold text-white disabled:bg-ink-200 disabled:text-ink-500"
      >
        {flash ? <Check className="h-4 w-4" aria-label="Enregistré" /> : pending ? "…" : "OK"}
      </button>
    </form>
  );
}

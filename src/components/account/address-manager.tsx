"use client";

import { useEffect, useState, useTransition } from "react";
import type { Address } from "@prisma/client";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/actions/account";
import { AddressFields } from "@/components/account/address-fields";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/form";
import { Badge, EmptyState } from "@/components/ui/misc";
import { useFormAction } from "@/lib/use-form-action";

function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const { state, onSubmit, pending } = useFormAction(saveAddress);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-ink-200 p-6" noValidate>
      <h3 className="heading-md">{address ? "Modifier l'adresse" : "Nouvelle adresse"}</h3>
      {address && <input type="hidden" name="id" value={address.id} />}
      {state.message && !state.ok && <Alert tone="error">{state.message}</Alert>}
      <AddressFields values={address} errors={state.errors} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault}
          className="h-4 w-4 rounded border-ink-300 text-ink focus:ring-ink"
        />
        Définir comme adresse par défaut
      </label>
      <div className="flex gap-3">
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      {addresses.length === 0 && editing === null && (
        <EmptyState title="Aucune adresse enregistrée">Ajoutez une adresse pour commander plus rapidement.</EmptyState>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex flex-col rounded-2xl border border-ink-200 p-5">
            <div className="flex items-start justify-between gap-2">
              <MapPin className="h-5 w-5 flex-none" aria-hidden="true" />
              {a.isDefault && <Badge>Par défaut</Badge>}
            </div>
            <address className="mt-3 flex-1 text-sm not-italic leading-relaxed">
              <strong>{a.fullName}</strong>
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.postalCode} {a.city}, {a.country}
              {a.phone && (
                <>
                  <br />
                  {a.phone}
                </>
              )}
            </address>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <button type="button" onClick={() => setEditing(a)} className="inline-flex items-center gap-1 hover:underline">
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier
              </button>
              {!a.isDefault && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => setDefaultAddress(a.id))}
                  className="hover:underline"
                >
                  Définir par défaut
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (confirm("Supprimer cette adresse ?")) startTransition(() => deleteAddress(a.id));
                }}
                className="inline-flex items-center gap-1 text-red-700 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing ? (
        <AddressForm
          key={editing === "new" ? "new" : editing.id}
          address={editing === "new" ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <Button variant="outline" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une adresse
        </Button>
      )}
    </div>
  );
}

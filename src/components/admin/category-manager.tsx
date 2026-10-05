"use client";

import { useEffect, useState, useTransition } from "react";
import type { Category } from "@prisma/client";
import { deleteCategory, saveCategory } from "@/actions/admin";
import { Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Alert, TextField } from "@/components/ui/form";
import { useFormAction } from "@/lib/use-form-action";

type Row = Category & { _count: { products: number } };

function CategoryForm({ category, onDone }: { category?: Row; onDone: () => void }) {
  const { state, onSubmit, pending } = useFormAction(saveCategory);
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <h2 className="font-display text-lg font-black uppercase">{category ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
        {category && <input type="hidden" name="id" value={category.id} />}
        <TextField label="Nom" name="name" defaultValue={category?.name} error={state.errors?.name} required />
        <TextField label="Slug" name="slug" defaultValue={category?.slug} error={state.errors?.slug} hint="Laissez vide pour le générer." />
        <TextField label="Description" name="description" defaultValue={category?.description ?? ""} error={state.errors?.description} />
        <TextField label="Image (URL)" name="image" type="url" defaultValue={category?.image ?? ""} error={state.errors?.image} />
        <div className="flex gap-3">
          <Button type="submit" variant="dark" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button variant="ghost" onClick={onDone}>
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function CategoryManager({ categories }: { categories: Row[] }) {
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <ul className="divide-y divide-ink-100 rounded-2xl bg-white shadow-sm">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-ink-500">
                  /boutique/{c.slug} · {c._count.products} produit{c._count.products > 1 ? "s" : ""}
                </p>
              </div>
              <button type="button" onClick={() => setEditing(c)} className="text-sm font-semibold underline">
                Modifier
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!confirm(`Supprimer la catégorie « ${c.name} » ?`)) return;
                  setError(null);
                  startTransition(async () => {
                    const res = await deleteCategory(c.id);
                    if (!res.ok) setError(res.message ?? "Suppression impossible.");
                  });
                }}
                className="text-sm font-semibold text-red-700 underline"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
        {!editing && (
          <Button variant="dark" onClick={() => setEditing("new")}>
            Nouvelle catégorie
          </Button>
        )}
      </div>
      {editing && (
        <CategoryForm
          key={editing === "new" ? "new" : editing.id}
          category={editing === "new" ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      )}
    </div>
  );
}

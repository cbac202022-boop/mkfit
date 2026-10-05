"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2, Wand2 } from "lucide-react";
import { saveProduct } from "@/actions/admin";
import { Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Select, Textarea, TextField } from "@/components/ui/form";
import { SmartImage } from "@/components/ui/smart-image";
import type { ProductInput } from "@/lib/validations";

type VariantRow = { id?: string; size: string; color: string; colorHex: string; stock: number };

export type ProductFormValues = Omit<ProductInput, "variants"> & { variants: VariantRow[] };

const empty: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compareAtPrice: null,
  brand: "MKFit",
  categoryId: "",
  featured: false,
  active: true,
  sizeLabel: "Taille",
  colorLabel: "Couleur",
  images: [""],
  variants: [{ size: "Unique", color: "Noir", colorHex: "#0a0a0a", stock: 10 }],
};

export function ProductForm({
  productId,
  initial,
  categories,
}: {
  productId?: string;
  initial?: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial ?? { ...empty, categoryId: categories[0]?.id ?? "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [genSizes, setGenSizes] = useState("S, M, L, XL");
  const [genColors, setGenColors] = useState("Noir:#0a0a0a, Blanc:#ffffff");

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const setImage = (i: number, url: string) => set("images", values.images.map((u, j) => (j === i ? url : u)));
  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...values.images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    set("images", next);
  };
  const setVariant = (i: number, patch: Partial<VariantRow>) =>
    set("variants", values.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  function generateVariants() {
    const sizes = genSizes.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = genColors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const [name, hex] = c.split(":").map((x) => x.trim());
        return { name, hex: /^#[0-9a-fA-F]{6}$/.test(hex ?? "") ? hex : "#000000" };
      });
    const existing = new Map(values.variants.map((v) => [`${v.size}|${v.color}`, v]));
    const rows = colors.flatMap((c) =>
      sizes.map((size) => existing.get(`${size}|${c.name}`) ?? { size, color: c.name, colorHex: c.hex, stock: 0 }),
    );
    if (rows.length) set("variants", rows);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const payload: ProductInput = {
        ...values,
        price: Number(values.price),
        compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
        images: values.images.map((u) => u.trim()).filter(Boolean),
        variants: values.variants.map((v) => ({ ...v, stock: Number(v.stock) })),
      };
      const result = await saveProduct(productId ?? null, payload);
      setErrors(result.errors ?? {});
      if (result.ok) {
        setMessage({ tone: "success", text: result.message ?? "Enregistré." });
        if (!productId && result.id) router.push(`/admin/produits/${result.id}?cree=1`);
        else router.refresh();
      } else {
        setMessage({ tone: "error", text: result.message ?? "Le formulaire contient des erreurs." });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-black uppercase">Informations</h2>
            <TextField label="Nom" name="name" value={values.name} onChange={(e) => set("name", e.target.value)} error={errors.name} required />
            <TextField
              label="Slug (URL)"
              name="slug"
              value={values.slug ?? ""}
              onChange={(e) => set("slug", e.target.value)}
              error={errors.slug}
              hint="Laissez vide pour le générer à partir du nom."
            />
            <Field label="Description" name="description" error={errors.description}>
              <Textarea
                id="description"
                rows={6}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                aria-invalid={errors.description ? true : undefined}
              />
            </Field>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display text-lg font-black uppercase">Images</h2>
            <p className="text-sm text-ink-500">URL d&apos;images (Unsplash, placehold.co ou tout autre hébergement). La première est l&apos;image principale.</p>
            {errors.images && <Alert tone="error">{errors.images}</Alert>}
            <ul className="space-y-3">
              {values.images.map((url, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="relative h-14 w-12 flex-none overflow-hidden rounded bg-ink-100">
                    {/^https?:\/\//.test(url) && <SmartImage src={url} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <label htmlFor={`image-${i}`} className="sr-only">
                    URL de l&apos;image {i + 1}
                  </label>
                  <Input
                    id={`image-${i}`}
                    value={url}
                    onChange={(e) => setImage(i, e.target.value)}
                    placeholder="https://…"
                    aria-invalid={errors[`images.${i}`] ? true : undefined}
                    className={errors[`images.${i}`] ? "border-red-600" : ""}
                  />
                  <div className="flex">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-2 disabled:opacity-30" aria-label="Monter l'image">
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, 1)}
                      disabled={i === values.images.length - 1}
                      className="p-2 disabled:opacity-30"
                      aria-label="Descendre l'image"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => set("images", values.images.filter((_, j) => j !== i))}
                      disabled={values.images.length === 1}
                      className="p-2 text-red-700 disabled:opacity-30"
                      aria-label="Supprimer l'image"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" onClick={() => set("images", [...values.images, ""])}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une image
            </Button>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display text-lg font-black uppercase">Variantes et stock</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Libellé « taille »" name="sizeLabel" value={values.sizeLabel} onChange={(e) => set("sizeLabel", e.target.value)} />
              <TextField label="Libellé « couleur »" name="colorLabel" value={values.colorLabel} onChange={(e) => set("colorLabel", e.target.value)} />
            </div>

            <details className="rounded-xl bg-ink-100 p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                <Wand2 className="mr-2 inline h-4 w-4" aria-hidden="true" />
                Générer toutes les combinaisons
              </summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <TextField label="Tailles (séparées par des virgules)" name="gen-sizes" value={genSizes} onChange={(e) => setGenSizes(e.target.value)} />
                <TextField
                  label="Couleurs (Nom:#hex, …)"
                  name="gen-colors"
                  value={genColors}
                  onChange={(e) => setGenColors(e.target.value)}
                />
              </div>
              <Button variant="dark" size="sm" className="mt-3" onClick={generateVariants}>
                Générer
              </Button>
              <p className="mt-2 text-xs text-ink-500">Les stocks des combinaisons existantes sont conservés.</p>
            </details>

            {errors.variants && <Alert tone="error">{errors.variants}</Alert>}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-ink-500">
                    <th scope="col" className="pb-2">{values.sizeLabel}</th>
                    <th scope="col" className="pb-2">{values.colorLabel}</th>
                    <th scope="col" className="pb-2">Teinte</th>
                    <th scope="col" className="pb-2">Stock</th>
                    <th scope="col" className="pb-2">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {values.variants.map((v, i) => (
                    <tr key={v.id ?? `new-${i}`}>
                      <td className="py-1 pr-2">
                        <Input aria-label={`${values.sizeLabel} de la variante ${i + 1}`} value={v.size} onChange={(e) => setVariant(i, { size: e.target.value })} className="h-9" />
                      </td>
                      <td className="py-1 pr-2">
                        <Input aria-label={`${values.colorLabel} de la variante ${i + 1}`} value={v.color} onChange={(e) => setVariant(i, { color: e.target.value })} className="h-9" />
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          type="color"
                          aria-label={`Teinte de la variante ${i + 1}`}
                          value={v.colorHex}
                          onChange={(e) => setVariant(i, { colorHex: e.target.value })}
                          className="h-9 w-12 cursor-pointer rounded border border-ink-300"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          min={0}
                          aria-label={`Stock de la variante ${i + 1}`}
                          value={v.stock}
                          onChange={(e) => setVariant(i, { stock: Number(e.target.value) })}
                          className="h-9 w-24"
                        />
                      </td>
                      <td className="py-1">
                        <button
                          type="button"
                          onClick={() => set("variants", values.variants.filter((_, j) => j !== i))}
                          disabled={values.variants.length === 1}
                          className="p-2 text-red-700 disabled:opacity-30"
                          aria-label={`Supprimer la variante ${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => set("variants", [...values.variants, { size: "", color: "", colorHex: "#000000", stock: 0 }])}
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une variante
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-black uppercase">Prix</h2>
            <TextField
              label="Prix (€ TTC)"
              name="price"
              type="number"
              step="0.01"
              min={0}
              value={values.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              error={errors.price}
              required
            />
            <TextField
              label="Prix barré (€, facultatif)"
              name="compareAtPrice"
              type="number"
              step="0.01"
              min={0}
              value={values.compareAtPrice ?? ""}
              onChange={(e) => set("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))}
              error={errors.compareAtPrice}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display text-lg font-black uppercase">Organisation</h2>
            <Field label="Catégorie" name="categoryId" error={errors.categoryId}>
              <Select id="categoryId" value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <TextField label="Marque" name="brand" value={values.brand} onChange={(e) => set("brand", e.target.value)} error={errors.brand} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 text-ink focus:ring-ink"
              />
              En ligne (visible dans la boutique)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 text-ink focus:ring-ink"
              />
              Mettre en vedette sur l&apos;accueil
            </label>
          </Card>

          <Button type="submit" size="lg" variant="dark" className="w-full" disabled={pending}>
            {pending ? "Enregistrement…" : productId ? "Enregistrer les modifications" : "Créer le produit"}
          </Button>
        </div>
      </div>
    </form>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/ui";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductForm } from "@/components/admin/product-form";
import { BackLink } from "@/components/order/order-summary";
import { Alert } from "@/components/ui/form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Modifier le produit" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cree?: string }>;
}) {
  await requireAdmin();
  const [{ id }, { cree }] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: [{ color: "asc" }, { size: "asc" }] } },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <BackLink href="/admin/produits">Produits</BackLink>
      <AdminHeader
        title={product.name}
        action={
          <div className="flex items-center gap-4 text-sm">
            {product.active && (
              <Link href={`/produit/${product.slug}`} className="font-semibold underline" target="_blank">
                Voir en boutique ↗
              </Link>
            )}
            <DeleteProductButton id={product.id} name={product.name} redirectTo="/admin/produits" />
          </div>
        }
      />
      {cree && (
        <div className="mb-6">
          <Alert tone="success">Produit créé avec succès.</Alert>
        </div>
      )}
      <ProductForm
        productId={product.id}
        categories={categories}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price / 100,
          compareAtPrice: product.compareAtPrice ? product.compareAtPrice / 100 : null,
          brand: product.brand,
          categoryId: product.categoryId,
          featured: product.featured,
          active: product.active,
          sizeLabel: product.sizeLabel,
          colorLabel: product.colorLabel,
          images: product.images.map((i) => i.url),
          variants: product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock })),
        }}
      />
    </>
  );
}

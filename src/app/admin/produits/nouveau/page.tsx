import { AdminHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { BackLink } from "@/components/order/order-summary";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <BackLink href="/admin/produits">Produits</BackLink>
      <AdminHeader title="Nouveau produit" />
      <ProductForm categories={categories} />
    </>
  );
}

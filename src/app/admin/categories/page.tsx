import { AdminHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <>
      <AdminHeader title="Catégories" description="Une catégorie ne peut être supprimée que si elle ne contient aucun produit." />
      <CategoryManager categories={categories} />
    </>
  );
}

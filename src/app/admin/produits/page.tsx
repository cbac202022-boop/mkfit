import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, Table, Td, Th } from "@/components/admin/ui";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Pagination } from "@/components/catalog/pagination";
import { ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

const PER_PAGE = 15;

export const metadata = { title: "Produits" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const { q = "", page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);
  const where = q ? { OR: [{ name: { contains: q } }, { brand: { contains: q } }] } : {};

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { select: { stock: true } },
      },
    }),
  ]);

  const href = (p: number) => `/admin/produits?${new URLSearchParams({ ...(q && { q }), ...(p > 1 && { page: String(p) }) })}`;

  return (
    <>
      <AdminHeader
        title="Produits"
        description={`${total} produit${total > 1 ? "s" : ""}`}
        action={
          <ButtonLink href="/admin/produits/nouveau" variant="dark">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nouveau produit
          </ButtonLink>
        }
      />
      <form className="mb-4 flex max-w-md gap-2" role="search">
        <label htmlFor="admin-search" className="sr-only">
          Rechercher un produit
        </label>
        <input
          id="admin-search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom ou marque…"
          className="h-10 flex-1 rounded-lg border-ink-300 text-sm focus:border-ink focus:ring-ink"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 text-sm font-semibold text-white">
          Rechercher
        </button>
      </form>
      <Table>
        <thead>
          <tr>
            <Th>Produit</Th>
            <Th>Catégorie</Th>
            <Th>Prix</Th>
            <Th>Stock</Th>
            <Th>Statut</Th>
            <Th>
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <tr key={p.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 flex-none overflow-hidden rounded bg-ink-100">
                      {p.images[0] && <SmartImage src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />}
                    </div>
                    <div>
                      <Link href={`/admin/produits/${p.id}`} className="font-semibold hover:underline">
                        {p.name}
                      </Link>
                      <p className="text-xs text-ink-500">{p.brand}</p>
                    </div>
                  </div>
                </Td>
                <Td>{p.category.name}</Td>
                <Td>{formatPrice(p.price)}</Td>
                <Td className={stock === 0 ? "font-bold text-red-700" : stock <= 10 ? "font-bold text-amber-800" : ""}>
                  {stock}
                </Td>
                <Td>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${p.active ? "bg-green-100 text-green-900" : "bg-ink-200"}`}>
                    {p.active ? "En ligne" : "Masqué"}
                  </span>
                  {p.featured && <span className="ml-1 rounded-full bg-accent px-2 py-1 text-xs font-semibold">Vedette</span>}
                </Td>
                <Td className="whitespace-nowrap text-right">
                  <Link href={`/admin/produits/${p.id}`} className="mr-3 font-semibold underline">
                    Modifier
                  </Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination page={page} pageCount={Math.ceil(total / PER_PAGE)} hrefFor={href} />
    </>
  );
}

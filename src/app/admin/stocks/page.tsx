import Link from "next/link";
import { AdminHeader, Table, Td, Th } from "@/components/admin/ui";
import { StockInput } from "@/components/admin/stock-input";
import { Pagination } from "@/components/catalog/pagination";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Stocks" };

const PER_PAGE = 30;
const LOW = 5;

export default async function StocksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; faible?: string; page?: string }>;
}) {
  await requireAdmin();
  const { q = "", faible, page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);
  const where = {
    ...(faible === "1" && { stock: { lte: LOW } }),
    ...(q && { OR: [{ sku: { contains: q } }, { product: { name: { contains: q } } }] }),
  };

  const [total, variants] = await Promise.all([
    prisma.variant.count({ where }),
    prisma.variant.findMany({
      where,
      include: { product: { select: { id: true, name: true } } },
      orderBy: faible === "1" ? [{ stock: "asc" }] : [{ product: { name: "asc" } }, { color: "asc" }, { size: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const href = (p: number) =>
    `/admin/stocks?${new URLSearchParams({ ...(q && { q }), ...(faible && { faible }), ...(p > 1 && { page: String(p) }) })}`;

  return (
    <>
      <AdminHeader title="Gestion des stocks" description={`${total} variante${total > 1 ? "s" : ""}`} />
      <form className="mb-4 flex flex-wrap items-center gap-3" role="search">
        <label htmlFor="stock-search" className="sr-only">
          Rechercher
        </label>
        <input
          id="stock-search"
          name="q"
          defaultValue={q}
          placeholder="Produit ou SKU…"
          className="h-10 w-64 rounded-lg border-ink-300 text-sm focus:border-ink focus:ring-ink"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="faible" value="1" defaultChecked={faible === "1"} className="h-4 w-4 rounded text-ink focus:ring-ink" />
          Stock faible uniquement (≤ {LOW})
        </label>
        <button type="submit" className="h-10 rounded-lg bg-ink px-4 text-sm font-semibold text-white">
          Filtrer
        </button>
      </form>
      <Table>
        <thead>
          <tr>
            <Th>Produit</Th>
            <Th>Variante</Th>
            <Th>SKU</Th>
            <Th className="text-right">Stock</Th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.id}>
              <Td>
                <Link href={`/admin/produits/${v.product.id}`} className="font-semibold hover:underline">
                  {v.product.name}
                </Link>
              </Td>
              <Td>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border border-ink-300" style={{ backgroundColor: v.colorHex }} aria-hidden="true" />
                  {v.color} · {v.size}
                </span>
              </Td>
              <Td className="font-mono text-xs text-ink-500">{v.sku}</Td>
              <Td>
                <StockInput variantId={v.id} initial={v.stock} label={`Stock de ${v.product.name} ${v.color} ${v.size}`} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={page} pageCount={Math.ceil(total / PER_PAGE)} hrefFor={href} />
    </>
  );
}

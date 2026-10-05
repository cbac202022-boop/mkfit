import Link from "next/link";
import { AdminHeader, Card, Table, Td, Th } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";

const LOW_STOCK = 5;

export default async function AdminDashboard() {
  await requireAdmin();
  const [revenue, orderCount, pendingCount, productCount, lowStock, recentOrders, customers] = await Promise.all([
    prisma.order.aggregate({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.variant.findMany({
      where: { stock: { lte: LOW_STOCK } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const stats = [
    { label: "Chiffre d'affaires", value: formatPrice(revenue._sum.total ?? 0) },
    { label: "Commandes", value: orderCount },
    { label: "À expédier", value: pendingCount, href: "/admin/commandes?statut=PAID" },
    { label: "Produits actifs", value: productCount },
    { label: "Clients", value: customers },
  ];

  return (
    <>
      <AdminHeader title="Tableau de bord" description="Vue d'ensemble de la boutique." />
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Card className="h-full">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-black">
                {s.href ? (
                  <Link href={s.href} className="hover:underline">
                    {s.value}
                  </Link>
                ) : (
                  s.value
                )}
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section aria-labelledby="recent-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-title" className="font-display text-lg font-black uppercase">
              Dernières commandes
            </h2>
            <Link href="/admin/commandes" className="text-sm font-semibold underline">
              Tout voir
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <Card>
              <p className="text-sm text-ink-500">Aucune commande pour le moment.</p>
            </Card>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>N°</Th>
                  <Th>Date</Th>
                  <Th>Statut</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <Td>
                      <Link href={`/admin/commandes/${o.id}`} className="font-semibold underline-offset-2 hover:underline">
                        {o.number}
                      </Link>
                    </Td>
                    <Td>{formatDate(o.createdAt)}</Td>
                    <Td>
                      <StatusBadge status={o.status} />
                    </Td>
                    <Td className="text-right font-semibold">{formatPrice(o.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>

        <section aria-labelledby="stock-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="stock-title" className="font-display text-lg font-black uppercase">
              Stocks faibles
            </h2>
            <Link href="/admin/stocks?faible=1" className="text-sm font-semibold underline">
              Gérer les stocks
            </Link>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Produit</Th>
                <Th>Variante</Th>
                <Th className="text-right">Stock</Th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((v) => (
                <tr key={v.id}>
                  <Td>
                    <Link href={`/admin/produits/${v.product.id}`} className="font-semibold hover:underline">
                      {v.product.name}
                    </Link>
                  </Td>
                  <Td>
                    {v.color} · {v.size}
                  </Td>
                  <Td className={`text-right font-bold ${v.stock === 0 ? "text-red-700" : "text-amber-800"}`}>{v.stock}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      </div>
    </>
  );
}

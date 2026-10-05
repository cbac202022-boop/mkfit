import Link from "next/link";
import { AdminHeader, Table, Td, Th } from "@/components/admin/ui";
import { Pagination } from "@/components/catalog/pagination";
import { StatusBadge } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOrderStatus, ORDER_STATUSES } from "@/lib/site";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Commandes" };

const PER_PAGE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; page?: string }>;
}) {
  await requireAdmin();
  const { statut, page: rawPage } = await searchParams;
  const status = statut && isOrderStatus(statut) ? statut : undefined;
  const page = Math.max(1, Number(rawPage) || 1);
  const where = status ? { status } : {};

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const href = (p: number) =>
    `/admin/commandes?${new URLSearchParams({ ...(status && { statut: status }), ...(p > 1 && { page: String(p) }) })}`;
  const tab = "rounded-full px-3 py-1.5 text-sm font-semibold";

  return (
    <>
      <AdminHeader title="Commandes" description={`${total} commande${total > 1 ? "s" : ""}`} />
      <nav aria-label="Filtrer par statut" className="mb-4">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link href="/admin/commandes" aria-current={!status ? "page" : undefined} className={cn(tab, !status ? "bg-ink text-white" : "bg-white")}>
              Toutes
            </Link>
          </li>
          {Object.entries(ORDER_STATUSES).map(([key, s]) => (
            <li key={key}>
              <Link
                href={`/admin/commandes?statut=${key}`}
                aria-current={status === key ? "page" : undefined}
                className={cn(tab, status === key ? "bg-ink text-white" : "bg-white")}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {orders.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-sm text-ink-500">Aucune commande.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>N°</Th>
              <Th>Date</Th>
              <Th>Client</Th>
              <Th>Articles</Th>
              <Th>Statut</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <Td>
                  <Link href={`/admin/commandes/${o.id}`} className="font-semibold hover:underline">
                    {o.number}
                  </Link>
                </Td>
                <Td>{formatDate(o.createdAt)}</Td>
                <Td>
                  <p>{o.shippingName}</p>
                  <p className="text-xs text-ink-500">{o.email}</p>
                </Td>
                <Td>{o._count.items}</Td>
                <Td>
                  <StatusBadge status={o.status} />
                </Td>
                <Td className="text-right font-semibold">{formatPrice(o.total)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Pagination page={page} pageCount={Math.ceil(total / PER_PAGE)} hrefFor={href} />
    </>
  );
}

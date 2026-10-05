import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, StatusBadge } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title" className="heading-md mb-6">
        Historique des commandes
      </h2>
      {orders.length === 0 ? (
        <EmptyState title="Aucune commande" action={<ButtonLink href="/boutique">Commencer mes achats</ButtonLink>}>
          Vos commandes apparaîtront ici.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-ink-200 rounded-2xl border border-ink-200">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/compte/commandes/${order.id}`}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5 hover:bg-ink-100"
              >
                <div className="min-w-32">
                  <p className="font-bold">N° {order.number}</p>
                  <p className="text-sm text-ink-500">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
                <p className="text-sm text-ink-500">
                  {order._count.items} article{order._count.items > 1 ? "s" : ""}
                </p>
                <p className="ml-auto font-bold">{formatPrice(order.total)}</p>
                <ChevronRight className="h-5 w-5 text-ink-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { notFound } from "next/navigation";
import { AdminHeader, Card } from "@/components/admin/ui";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { BackLink, OrderSummary } from "@/components/order/order-summary";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Détail de la commande" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  if (!order) notFound();

  return (
    <>
      <BackLink href="/admin/commandes">Commandes</BackLink>
      <AdminHeader title={`Commande ${order.number}`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <OrderSummary order={order} />
        </Card>
        <div className="space-y-6">
          <Card>
            <OrderStatusForm orderId={order.id} status={order.status} />
          </Card>
          <Card className="space-y-2 text-sm">
            <h2 className="font-display text-lg font-black uppercase">Client</h2>
            <p>{order.user ? `${order.user.name} (compte client)` : "Commande invité"}</p>
            <p>
              <a href={`mailto:${order.email}`} className="underline">
                {order.email}
              </a>
            </p>
            {order.shippingPhone && <p>{order.shippingPhone}</p>}
            {order.paidAt && <p className="text-ink-500">Payée le {formatDate(order.paidAt)}</p>}
            {order.stripeSessionId && <p className="break-all font-mono text-xs text-ink-500">Stripe : {order.stripeSessionId}</p>}
          </Card>
        </div>
      </div>
    </>
  );
}

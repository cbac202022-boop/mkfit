import { notFound } from "next/navigation";
import { BackLink, OrderSummary } from "@/components/order/order-summary";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <section>
      <BackLink href="/compte">Toutes mes commandes</BackLink>
      <OrderSummary order={order} />
    </section>
  );
}

import type { Metadata } from "next";
import { CheckCircle2, Clock } from "lucide-react";
import { ClearCart } from "@/components/checkout/clear-cart";
import { OrderSummary } from "@/components/order/order-summary";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { markOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Confirmation de commande", robots: { index: false } };

async function findOrder(sessionId?: string, orderId?: string) {
  if (sessionId && stripe) {
    // Vérifie le paiement directement auprès de Stripe (utile si le webhook n'est pas configuré en local)
    const checkout = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
    const id = checkout?.metadata?.orderId;
    if (!checkout || !id) return null;
    if (checkout.payment_status === "paid") await markOrderPaid(id);
    return prisma.order.findUnique({ where: { id }, include: { items: true } });
  }
  // Mode démo : l'identifiant (cuid non devinable) sert de lien de confirmation
  if (orderId && !stripe) return prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  return null;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; commande?: string }>;
}) {
  const { session_id, commande } = await searchParams;
  const order = await findOrder(session_id, commande);

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState title="Commande introuvable" action={<ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>}>
          Le lien de confirmation est invalide ou a expiré.
        </EmptyState>
      </div>
    );
  }

  const paid = order.status !== "PENDING" && order.status !== "CANCELLED";

  return (
    <div className="container max-w-3xl py-16">
      {paid && <ClearCart />}
      <div className="mb-10 text-center">
        {paid ? (
          <CheckCircle2 className="mx-auto h-16 w-16 rounded-full bg-accent p-2 text-ink" aria-hidden="true" />
        ) : (
          <Clock className="mx-auto h-16 w-16 text-ink-400" aria-hidden="true" />
        )}
        <h1 className="heading-lg mt-6">{paid ? "Merci pour votre commande !" : "Paiement en cours de validation"}</h1>
        <p className="mt-3 text-ink-500">
          {paid
            ? `Votre commande N° ${order.number} est confirmée et sera expédiée sous 24 h ouvrées.`
            : "Nous attendons la confirmation de votre banque. Actualisez cette page dans quelques instants."}
        </p>
      </div>
      <div className="rounded-2xl border border-ink-200 p-6 sm:p-8">
        <OrderSummary order={order} />
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/boutique">Continuer mes achats</ButtonLink>
        {order.userId && (
          <ButtonLink href={`/compte/commandes/${order.id}`} variant="outline">
            Suivre ma commande
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

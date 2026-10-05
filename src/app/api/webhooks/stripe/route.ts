import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { markOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Webhook Stripe. En local :
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * puis copier le secret « whsec_… » dans STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook Stripe non configuré." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature manquante." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId && session.payment_status === "paid") await markOrderPaid(orderId);
      break;
    }
    case "checkout.session.expired": {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) {
        await prisma.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

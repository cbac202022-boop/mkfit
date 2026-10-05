import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { CheckoutError, createPendingOrder, markOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import { stripe } from "@/lib/stripe";
import { checkoutSchema, fieldErrors } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Certains champs sont invalides.", errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const session = await getSession();

  try {
    const { order, shippingLabel } = await createPendingOrder(parsed.data, session?.user.id ?? null);
    const origin = siteConfig.url;

    // Mode démo (pas de clé Stripe) : paiement simulé
    if (!stripe) {
      await markOrderPaid(order.id);
      return NextResponse.json({ url: `/commande/confirmation?commande=${order.id}` });
    }

    const coupon =
      order.discount > 0
        ? await stripe.coupons.create({
            amount_off: order.discount,
            currency: "eur",
            duration: "once",
            name: order.promoCode ?? "Remise",
            max_redemptions: 1,
          })
        : null;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: item.unitPrice,
          product_data: {
            name: item.name,
            description: [item.color, item.size !== "Unique" ? item.size : null].filter(Boolean).join(" · "),
            ...(item.image && { images: [item.image] }),
          },
        },
      })),
      ...(coupon && { discounts: [{ coupon: coupon.id }] }),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: shippingLabel,
            fixed_amount: { amount: order.shippingCost, currency: "eur" },
          },
        },
      ],
      success_url: `${origin}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/commande?annule=1`,
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[checkout]", error);
    return NextResponse.json({ error: "Le paiement n'a pas pu être initialisé. Réessayez dans un instant." }, { status: 500 });
  }
}

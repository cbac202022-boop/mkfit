import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Commande", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ annule?: string }> }) {
  const { annule } = await searchParams;
  const session = await getSession();
  const addresses = session?.user
    ? await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div className="container py-10">
      <h1 className="heading-lg mb-8">Finaliser ma commande</h1>
      <CheckoutForm
        email={session?.user.email ?? undefined}
        isLoggedIn={Boolean(session?.user)}
        savedAddresses={addresses}
        stripeEnabled={Boolean(stripe)}
        cancelled={annule === "1"}
      />
    </div>
  );
}

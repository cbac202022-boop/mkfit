import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/account/register-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const session = await getSession();
  if (session?.user) redirect("/compte");

  return (
    <div className="container flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="heading-lg">Créer un compte</h1>
        <p className="mb-8 mt-2 text-ink-500">Suivez vos commandes et enregistrez vos favoris en quelques secondes.</p>
        <RegisterForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}

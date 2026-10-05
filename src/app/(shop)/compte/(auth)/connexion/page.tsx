import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/account/login-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const session = await getSession();
  if (session?.user) redirect("/compte");

  return (
    <div className="container flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="heading-lg">Connexion</h1>
        <p className="mb-8 mt-2 text-ink-500">Retrouvez vos commandes, adresses et favoris.</p>
        <LoginForm callbackUrl={callbackUrl} />
        <div className="mt-10 rounded-xl border border-dashed border-ink-300 p-4 text-xs text-ink-500">
          <p className="font-semibold text-ink">Comptes de démonstration</p>
          <p className="mt-1">Client : client@mkfit.fr / Client123!</p>
          <p>Admin : admin@mkfit.fr / Admin123!</p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="container py-10">
      <header className="mb-8">
        <p className="eyebrow text-ink-500">Mon compte</p>
        <h1 className="heading-lg mt-1">Bonjour {user.name?.split(" ")[0]} 👋</h1>
      </header>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

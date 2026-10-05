import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Admin MKFit" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col bg-ink-100 lg:flex-row">
      <aside className="dark-surface flex flex-col gap-6 bg-ink p-4 text-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:p-6">
        <div className="flex items-center justify-between lg:block">
          <Logo light />
          <p className="text-xs text-ink-300 lg:mt-2">Connecté : {admin.name}</p>
        </div>
        <AdminNav />
      </aside>
      <main id="contenu" className="min-w-0 flex-1 p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}

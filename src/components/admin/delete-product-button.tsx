"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/actions/admin";

export function DeleteProductButton({ id, name, redirectTo }: { id: string; name: string; redirectTo?: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Supprimer définitivement « ${name} » ?`)) return;
        startTransition(async () => {
          await deleteProduct(id);
          if (redirectTo) router.push(redirectTo);
          router.refresh();
        });
      }}
      className="font-semibold text-red-700 underline disabled:opacity-50"
    >
      {pending ? "Suppression…" : "Supprimer"}
    </button>
  );
}

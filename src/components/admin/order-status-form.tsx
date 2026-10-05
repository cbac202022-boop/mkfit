"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Alert, Select } from "@/components/ui/form";
import { ORDER_STATUSES } from "@/lib/site";

export function OrderStatusForm({ orderId, status }: { orderId: string; status: string }) {
  const [value, setValue] = useState(status);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value === "CANCELLED" && !confirm("Annuler cette commande ? Les articles payés seront remis en stock.")) return;
        startTransition(async () => {
          const res = await updateOrderStatus(orderId, value);
          setMessage({ ok: res.ok, text: res.message ?? (res.ok ? "Statut mis à jour." : "Erreur.") });
          router.refresh();
        });
      }}
      className="space-y-3"
    >
      <label htmlFor="status" className="block text-sm font-semibold">
        Statut de la commande
      </label>
      <Select id="status" value={value} onChange={(e) => setValue(e.target.value)} disabled={status === "CANCELLED"}>
        {Object.entries(ORDER_STATUSES).map(([key, s]) => (
          <option key={key} value={key}>
            {s.label}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="dark" className="w-full" disabled={pending || value === status}>
        {pending ? "Mise à jour…" : "Mettre à jour"}
      </Button>
      {message && <Alert tone={message.ok ? "success" : "error"}>{message.text}</Alert>}
    </form>
  );
}

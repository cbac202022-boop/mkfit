import Link from "next/link";
import type { Order, OrderItem } from "@prisma/client";
import { SmartImage } from "@/components/ui/smart-image";
import { StatusBadge } from "@/components/ui/misc";
import { SHIPPING_METHODS, type ShippingMethod } from "@/lib/pricing";
import { formatDate, formatPrice } from "@/lib/utils";

/** Détail d'une commande : utilisé par l'espace client, l'admin et la page de confirmation. */
export function OrderSummary({ order, showStatus = true }: { order: Order & { items: OrderItem[] }; showStatus?: boolean }) {
  const method = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-bold">Commande N° {order.number}</p>
        <span className="text-sm text-ink-500">du {formatDate(order.createdAt)}</span>
        {showStatus && <StatusBadge status={order.status} />}
      </div>

      <ul className="divide-y divide-ink-200 border-y border-ink-200">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4">
            <div className="relative h-20 w-16 flex-none overflow-hidden rounded-lg bg-ink-100">
              {item.image && <SmartImage src={item.image} alt="" fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-ink-500">
                {item.color}
                {item.size !== "Unique" && ` · ${item.size}`} · Qté {item.quantity}
              </p>
            </div>
            <p className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="eyebrow mb-2 font-sans">Livraison</h3>
          <address className="text-sm not-italic leading-relaxed">
            {order.shippingName}
            <br />
            {order.shippingLine1}
            {order.shippingLine2 && (
              <>
                <br />
                {order.shippingLine2}
              </>
            )}
            <br />
            {order.shippingPostal} {order.shippingCity}
            <br />
            {order.shippingCountry}
          </address>
          <p className="mt-2 text-sm text-ink-500">
            {method ? `${method.label} (${method.description})` : order.shippingMethod}
          </p>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-800">
              <dt>Remise {order.promoCode && `(${order.promoCode})`}</dt>
              <dd>-{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Livraison</dt>
            <dd>{order.shippingCost === 0 ? "Offerte" : formatPrice(order.shippingCost)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-bold">
            <dt>Total TTC</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-6 inline-block text-sm font-semibold underline underline-offset-4">
      ← {children}
    </Link>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { ORDER_STATUSES, isOrderStatus } from "@/lib/site";

export function Price({
  price,
  compareAt,
  className,
}: {
  price: number;
  compareAt?: number | null;
  className?: string;
}) {
  const onSale = compareAt != null && compareAt > price;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-bold">{formatPrice(price)}</span>
      {onSale && (
        <>
          <span className="sr-only">au lieu de</span>
          <s className="text-sm text-ink-400">{formatPrice(compareAt)}</s>
        </>
      )}
    </span>
  );
}

export function Stars({ rating, size = 16, showValue = false }: { rating: number; size?: number; showValue?: boolean }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={i <= rounded ? "fill-ink text-ink" : i - 0.5 === rounded ? "fill-ink-300 text-ink" : "text-ink-300"}
          />
        ))}
      </span>
      <span className={showValue ? "text-sm font-semibold" : "sr-only"}>
        {rating.toFixed(1).replace(".", ",")} sur 5
      </span>
    </span>
  );
}

export function Badge({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "dark" | "light" }) {
  const tones = {
    accent: "bg-accent text-ink",
    dark: "bg-ink text-white",
    light: "bg-white text-ink",
  };
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = isOrderStatus(status) ? ORDER_STATUSES[status] : { label: status, className: "bg-ink-100" };
  return <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold", s.className)}>{s.label}</span>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-ink-500">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="hover:text-ink hover:underline">
            Accueil
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            {item.href ? (
              <Link href={item.href} className="hover:text-ink hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-ink-200 px-6 py-16 text-center">
      <h2 className="heading-md">{title}</h2>
      {children && <div className="mt-2 max-w-md text-ink-500">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2 text-ink-500">{eyebrow}</p>}
        <h2 className="heading-lg">{title}</h2>
      </div>
      {action}
    </div>
  );
}

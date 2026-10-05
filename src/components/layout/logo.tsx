import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="MKFit, retour à l'accueil"
      className={cn("font-display text-2xl font-black uppercase italic tracking-tighter", className)}
    >
      <span className={light ? "text-white" : "text-ink"}>MK</span>
      <span className={cn("ml-0.5 rounded px-1", light ? "bg-accent text-ink" : "bg-ink text-accent")}>Fit</span>
    </Link>
  );
}

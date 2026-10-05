"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  productId,
  productName,
  initial,
  className,
  withLabel = false,
}: {
  productId: string;
  productName: string;
  initial: boolean;
  className?: string;
  withLabel?: boolean;
}) {
  const [favorite, setFavorite] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleFavorite(productId);
      if (!result.ok) {
        router.push(`/compte/connexion?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      setFavorite(result.favorite);
      router.refresh();
    });
  }

  const label = favorite ? `Retirer ${productName} des favoris` : `Ajouter ${productName} aux favoris`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={favorite}
      aria-label={withLabel ? undefined : label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60",
        withLabel
          ? "h-14 rounded-full border-2 border-ink px-6 text-sm font-bold uppercase hover:bg-ink-100"
          : "h-9 w-9 rounded-full bg-white/90 shadow hover:bg-white",
        className,
      )}
    >
      <Heart className={cn("h-5 w-5", favorite && "fill-red-600 text-red-600")} aria-hidden="true" />
      {withLabel && <span>{favorite ? "Dans vos favoris" : "Ajouter aux favoris"}</span>}
    </button>
  );
}

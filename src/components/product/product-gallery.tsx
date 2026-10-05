"use client";

import { useState } from "react";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }: { images: { url: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <ul className="scrollbar-none flex gap-3 overflow-x-auto md:flex-col" aria-label="Miniatures">
          {images.map((img, i) => (
            <li key={img.url} className="flex-none">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Afficher l'image ${i + 1} sur ${images.length}`}
                aria-current={i === index}
                className={cn(
                  "relative block h-20 w-16 overflow-hidden rounded-lg border-2 bg-ink-100 md:h-24 md:w-20",
                  i === index ? "border-ink" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <SmartImage src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-2xl bg-ink-100">
        {current && (
          <SmartImage
            key={current.url}
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
    </div>
  );
}

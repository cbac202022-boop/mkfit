"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice } from "@/lib/utils";

type Suggestion = { id: string; name: string; slug: string; price: number; brand: string; image: string | null };

/** Champ de recherche avec suggestions en direct (pattern ARIA « combobox »). */
export function SearchBar() {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-suggestions`;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await res.json()) as { results: Suggestion[] };
        setResults(data.results);
        setActive(-1);
        setOpen(true);
      } catch {
        // requête annulée ou réseau indisponible : on garde l'état précédent
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && results[active]) return go(`/produit/${results[active].slug}`);
    const q = query.trim();
    if (q) go(`/recherche?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const showList = open && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative">
      <form role="search" onSubmit={onSubmit}>
        <label htmlFor={`${id}-input`} className="sr-only">
          Rechercher un produit
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <input
            id={`${id}-input`}
            type="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
            autoComplete="off"
            placeholder="Rechercher : legging, whey, haltères…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-10 w-full rounded-full border-0 bg-ink-100 pl-10 pr-10 text-sm placeholder:text-ink-500 focus:bg-white focus:ring-2 focus:ring-ink"
          />
          {loading && (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-500" aria-hidden="true" />
          )}
        </div>
      </form>

      {showList && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xl">
          <ul id={listId} role="listbox" aria-label="Suggestions">
            {results.map((r, i) => (
              <li
                key={r.id}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(`/produit/${r.slug}`);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${i === active ? "bg-ink-200" : ""}`}
              >
                <div className="relative h-12 w-12 flex-none overflow-hidden rounded-lg bg-ink-100">
                  {r.image && <SmartImage src={r.image} alt="" fill sizes="48px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-ink-500">{r.brand}</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(r.price)}</span>
              </li>
            ))}
          </ul>
          {results.length === 0 && !loading && (
            <p className="px-4 py-3 text-sm text-ink-500" role="status">
              Aucun produit ne correspond à « {query.trim()} ».
            </p>
          )}
          {results.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                go(`/recherche?q=${encodeURIComponent(query.trim())}`);
              }}
              className="block w-full border-t border-ink-200 px-4 py-3 text-left text-sm font-bold hover:bg-ink-100"
            >
              Voir tous les résultats pour « {query.trim()} »
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false pendant le rendu serveur et la première hydratation, true ensuite.
 * Évite les écarts d'hydratation pour les données stockées dans localStorage (panier).
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

import { useEffect } from "react";
import { applySeo } from "./seo";

/**
 * Keeps the document head in sync during client-side navigation. The initial
 * document already has correct tags — the server injects them per route — so
 * this only matters once the user starts navigating in-app.
 */
export function useSeo({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): void {
  useEffect(() => {
    applySeo({ title, description, path });
  }, [title, description, path]);
}

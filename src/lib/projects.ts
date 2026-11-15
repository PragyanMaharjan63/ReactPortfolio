import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { openProjectStore, type ProjectStore } from "./storage";

// The store is cached on globalThis so dev hot reloads reuse one connection.
// Bump the key whenever the store's shape changes, or a running dev server
// keeps handing out the old object.
const STORE_KEY = "portfolioStoreV2";
const globalStore = globalThis as typeof globalThis & { [STORE_KEY]?: Promise<ProjectStore> };

export function getDatabase() {
  globalStore[STORE_KEY] ??= openProjectStore().catch((error) => {
    globalStore[STORE_KEY] = undefined;
    throw error;
  });
  return globalStore[STORE_KEY];
}

export const getProjects = cache(async () => {
  await connection();
  return (await (await getDatabase()).list()).map((record) => record.project);
});

export const getProject = cache(async (slug: string) => {
  await connection();
  return (await (await getDatabase()).get(slug))?.project;
});

export const getProfile = cache(async () => {
  await connection();
  return (await (await getDatabase()).getProfile()).profile;
});

import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { openProjectStore, type ProjectStore } from "./storage";

const globalStore = globalThis as typeof globalThis & { portfolioStore?: Promise<ProjectStore> };

export function getDatabase() {
  globalStore.portfolioStore ??= openProjectStore().catch((error) => {
    globalStore.portfolioStore = undefined;
    throw error;
  });
  return globalStore.portfolioStore;
}

export const getProjects = cache(async () => {
  await connection();
  return (await (await getDatabase()).list()).map((record) => record.project);
});

export const getProject = cache(async (slug: string) => {
  await connection();
  return (await (await getDatabase()).get(slug))?.project;
});

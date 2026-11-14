import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import type { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { openDatabase, readProject, readProjects } from "./database";

// Survive development hot reloads without opening another SQLite handle.
const globalDb = globalThis as typeof globalThis & { portfolioDatabases?: Map<string, DatabaseSync> };

export function getDatabase() {
  const filename = resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH ?? "./data/portfolio.sqlite");
  const databases = globalDb.portfolioDatabases ??= new Map();
  let db = databases.get(filename);
  if (!db) {
    db = openDatabase(filename);
    databases.set(filename, db);
  }
  return db;
}

// Read at request time: production builds must never bake in a local database.
// React cache deduplicates reads shared by a page and its metadata in one request.
export const getProjects = cache(async () => {
  await connection();
  return readProjects(getDatabase());
});

export const getProject = cache(async (slug: string) => {
  await connection();
  return readProject(getDatabase(), slug);
});

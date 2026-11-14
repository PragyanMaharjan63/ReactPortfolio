import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { projects as initialProjects, type Project } from "../data/projects";

/** The same schema is used by the app, seed CLI, and isolated database tests. */
export function openDatabase(filename = process.env.DATABASE_PATH ?? "./data/portfolio.sqlite") {
  if (filename !== ":memory:") mkdirSync(dirname(resolve(/* turbopackIgnore: true */ filename)), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

  const version = (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
  if (version > 1) {
    db.close();
    throw new Error("Database schema is newer than this app. Upgrade the app before opening it.");
  }
  if (version === 0) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          slug TEXT PRIMARY KEY,
          position INTEGER NOT NULL,
          document TEXT NOT NULL CHECK (json_valid(document)),
          updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ) STRICT;
      `);
      const insert = db.prepare("INSERT INTO projects (slug, position, document) VALUES (?, ?, ?) ON CONFLICT(slug) DO NOTHING");
      initialProjects.forEach((project, index) => insert.run(project.slug, index, JSON.stringify(project)));
      db.exec("PRAGMA user_version = 1; COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      db.close();
      throw error;
    }
  }
  return db;
}

export function readProjects(db: DatabaseSync): Project[] {
  const rows = db.prepare("SELECT document FROM projects ORDER BY position, slug").all() as { document: string }[];
  return rows.map((row) => JSON.parse(row.document) as Project);
}

export function readProject(db: DatabaseSync, slug: string): Project | undefined {
  const row = db.prepare("SELECT document FROM projects WHERE slug = ?").get(slug) as { document: string } | undefined;
  return row ? JSON.parse(row.document) as Project : undefined;
}

/** Explicit content refresh. Normal startup never overwrites runtime edits. */
export function seedProjects(db: DatabaseSync, projects: Project[] = initialProjects) {
  const upsert = db.prepare(`
    INSERT INTO projects (slug, position, document) VALUES (?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET position = excluded.position,
      document = excluded.document, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `);
  db.exec("BEGIN IMMEDIATE");
  try {
    projects.forEach((project, index) => upsert.run(project.slug, index, JSON.stringify(project)));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

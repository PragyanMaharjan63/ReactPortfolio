import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { createClient } from "@libsql/client/web";
import { openDatabase } from "./database";
import { projects as initialProjects, type Project } from "../data/projects";

type Statement = { sql: string; args?: (string | number | null)[] };
type Result = { rows: Record<string, unknown>[]; rowsAffected: number };
export interface SqlConnection {
  execute(statement: Statement): Promise<Result>;
  batch(statements: Statement[]): Promise<Result[]>;
}

export type ProjectRecord = { project: Project; position: number; revision: string };
export class StoreError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const revision = (document: string) => createHash("sha256").update(document).digest("hex");
const record = (row: Record<string, unknown>): ProjectRecord => ({
  project: JSON.parse(String(row.document)) as Project,
  position: Number(row.position),
  revision: revision(String(row.document)),
});

const projectTable = `CREATE TABLE IF NOT EXISTS projects (
  slug TEXT PRIMARY KEY, position INTEGER NOT NULL,
  document TEXT NOT NULL CHECK (json_valid(document)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT`;
const attemptsTable = `CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key TEXT PRIMARY KEY, failures INTEGER NOT NULL, retry_after INTEGER NOT NULL
) STRICT`;

/** Remote initialization is atomic and seeds once, preserving later edits/deletions. */
export async function initializeRemote(sql: SqlConnection) {
  await sql.batch([
    { sql: projectTable },
    { sql: "CREATE TABLE IF NOT EXISTS portfolio_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)" },
    { sql: attemptsTable },
    ...initialProjects.map((project, index) => ({
      sql: "INSERT INTO projects (slug, position, document) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM portfolio_meta WHERE key = 'initialized') ON CONFLICT(slug) DO NOTHING",
      args: [project.slug, index, JSON.stringify(project)],
    })),
    { sql: "INSERT INTO portfolio_meta (key, value) VALUES ('initialized', '1') ON CONFLICT(key) DO NOTHING" },
  ]);
}

export function createProjectStore(sql: SqlConnection, storage: "local" | "turso" | "preview" = "local") {
  const execute = (query: string, args?: Statement["args"]) => sql.execute({ sql: query, args });
  const assertWritable = () => {
    if (storage === "preview") throw new StoreError("Connect Turso to save dashboard changes on Vercel.", 503);
  };
  return {
    storage,
    async list() {
      return (await execute("SELECT document, position FROM projects ORDER BY position, slug")).rows.map(record);
    },
    async get(slug: string) {
      const row = (await execute("SELECT document, position FROM projects WHERE slug = ?", [slug])).rows[0];
      return row ? record(row) : undefined;
    },
    async create(project: Project) {
      assertWritable();
      const result = await execute("INSERT INTO projects (slug, position, document) SELECT ?, COALESCE(MAX(position), -1) + 1, ? FROM projects WHERE true ON CONFLICT(slug) DO NOTHING", [project.slug, JSON.stringify(project)]);
      if (!result.rowsAffected) throw new StoreError("That URL slug already exists. Choose another.", 409);
    },
    async update(slug: string, project: Project, expectedRevision?: string) {
      assertWritable();
      if (project.slug !== slug) throw new StoreError("Existing URL slugs cannot be changed.");
      const current = (await execute("SELECT document, position FROM projects WHERE slug = ?", [slug])).rows[0];
      if (!current) throw new StoreError("Project not found.", 404);
      if (!expectedRevision || revision(String(current.document)) !== expectedRevision) throw new StoreError("This project changed in another tab. Reload before saving.", 409);
      const result = await execute("UPDATE projects SET document = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE slug = ? AND document = ?", [JSON.stringify(project), slug, String(current.document)]);
      if (!result.rowsAffected) throw new StoreError("This project changed in another tab. Reload before saving.", 409);
    },
    async delete(slug: string, expectedRevision?: string) {
      assertWritable();
      const current = (await execute("SELECT document FROM projects WHERE slug = ?", [slug])).rows[0];
      if (!current) throw new StoreError("Project not found.", 404);
      if (!expectedRevision || revision(String(current.document)) !== expectedRevision) throw new StoreError("This project changed in another tab. Reload before deleting.", 409);
      const result = await execute("DELETE FROM projects WHERE slug = ? AND document = ?", [slug, String(current.document)]);
      if (!result.rowsAffected) throw new StoreError("Project changed. Reload before deleting.", 409);
    },
    async reorder(slugs: string[]) {
      assertWritable();
      const current = (await execute("SELECT slug FROM projects")).rows.map((row) => String(row.slug));
      if (slugs.length !== current.length || new Set(slugs).size !== slugs.length || current.some((slug) => !slugs.includes(slug))) throw new StoreError("The project list changed. Reload before reordering.", 409);
      await sql.batch(slugs.map((slug, position) => ({ sql: "UPDATE projects SET position = ? WHERE slug = ?", args: [position, slug] })));
    },
    async ping() { await execute("SELECT 1"); },
    async loginBlocked(key: string) {
      const row = (await execute("SELECT failures, retry_after FROM admin_login_attempts WHERE key = ?", [key])).rows[0];
      return Boolean(row && Number(row.failures) >= 5 && Number(row.retry_after) > Date.now());
    },
    async failedLogin(key: string) {
      const now = Date.now();
      await execute(`INSERT INTO admin_login_attempts (key, failures, retry_after) VALUES (?, 1, ?)
        ON CONFLICT(key) DO UPDATE SET failures = CASE WHEN retry_after <= ? THEN 1 ELSE failures + 1 END,
        retry_after = CASE WHEN retry_after <= ? THEN excluded.retry_after ELSE retry_after END`, [key, now + 15 * 60 * 1000, now, now]);
      await execute("DELETE FROM admin_login_attempts WHERE retry_after <= ?", [now]);
    },
    async clearLoginAttempts(key: string) { await execute("DELETE FROM admin_login_attempts WHERE key = ?", [key]); },
    async seed() {
      assertWritable();
      await sql.batch(initialProjects.map((project, position) => ({
        sql: "INSERT INTO projects (slug, position, document) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET position = excluded.position, document = excluded.document, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
        args: [project.slug, position, JSON.stringify(project)],
      })));
    },
  };
}

export type ProjectStore = ReturnType<typeof createProjectStore>;

export function localConnection(filename: string) {
  const db = openDatabase(filename);
  db.exec(attemptsTable);
  function execute({ sql, args = [] }: Statement): Result {
    const statement = db.prepare(sql);
    if (/^\s*(SELECT|PRAGMA)\b/i.test(sql)) return { rows: statement.all(...args), rowsAffected: 0 };
    const result = statement.run(...args);
    return { rows: [], rowsAffected: Number(result.changes) };
  }
  const connection: SqlConnection = {
    async execute(statement) { return execute(statement); },
    async batch(statements) {
      db.exec("BEGIN IMMEDIATE");
      try { const results = statements.map(execute); db.exec("COMMIT"); return results; }
      catch (error) { db.exec("ROLLBACK"); throw error; }
    },
  };
  return { connection, close: () => db.close() };
}

export async function openProjectStore() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    if (!/^(libsql|https):\/\//.test(url)) throw new Error("TURSO_DATABASE_URL must be a remote libsql:// or https:// URL.");
    if (!process.env.TURSO_AUTH_TOKEN) throw new Error("TURSO_AUTH_TOKEN is required for hosted SQLite.");
    const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    const connection: SqlConnection = {
      async execute(statement) {
        const result = await client.execute({ sql: statement.sql, args: statement.args ?? [] });
        return { rows: result.rows as Record<string, unknown>[], rowsAffected: result.rowsAffected };
      },
      async batch(statements) {
        const results = await client.batch(statements.map((statement) => ({ sql: statement.sql, args: statement.args ?? [] })), "write");
        return results.map((result) => ({ rows: result.rows as Record<string, unknown>[], rowsAffected: result.rowsAffected }));
      },
    };
    try { await initializeRemote(connection); } catch (error) { client.close(); throw error; }
    return createProjectStore(connection, "turso");
  }
  // An unconfigured Vercel deployment can preview its portfolio without ever
  // pretending that temporary function storage can persist dashboard edits.
  const preview = process.env.VERCEL === "1";
  const filename = preview ? ":memory:" : resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH ?? "./data/portfolio.sqlite");
  const { connection } = localConnection(filename);
  return createProjectStore(connection, preview ? "preview" : "local");
}

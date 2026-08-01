/**
 * Generates the server's bundled project fallback from the client's canonical
 * data module, so project content exists in exactly one authored place.
 *
 * Run: npm run sync:content  (runs automatically before the server build)
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(here, "..", "client", "src", "data", "projects.ts");
const target = path.join(here, "..", "server", "src", "content", "projects.json");

const mod = await import(source);
await writeFile(target, JSON.stringify(mod.projects, null, 2) + "\n", "utf8");
console.log(`[sync-content] wrote ${mod.projects.length} projects`);

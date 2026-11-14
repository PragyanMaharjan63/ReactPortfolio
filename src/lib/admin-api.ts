import "server-only";
import { isAdmin } from "./auth";
import { getDatabase } from "./projects";
import { StoreError, type ProjectStore } from "./storage";

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // Next may normalize request.url to localhost behind its server/proxy.
  // The browser-facing Host is what the incoming Origin must match.
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol === "https" ? "https:" : url.protocol;
  if (!origin || origin !== `${protocol}//${host}`) throw new StoreError("This request must come from this website.", 403);
}

export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new StoreError("Send JSON content.", 415);
  if (Number(request.headers.get("content-length")) > 100000) throw new StoreError("Request is too large.", 413);
  const body = await request.text();
  if (Buffer.byteLength(body) > 100000) throw new StoreError("Request is too large.", 413);
  try { return JSON.parse(body) as unknown; } catch { throw new StoreError("Invalid JSON."); }
}

export function privateJson(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

export function apiError(error: unknown) {
  if (error instanceof StoreError) return privateJson({ error: error.message }, error.status);
  console.error("[dashboard] Request failed", error);
  return privateJson({ error: "Could not complete the request. Please try again." }, 500);
}

export async function adminRoute(request: Request, action: (store: ProjectStore) => Promise<Response>) {
  try {
    if (!await isAdmin()) return privateJson({ error: "Please sign in." }, 401);
    if (request.method !== "GET") requireSameOrigin(request);
    const store = await getDatabase();
    if (store.storage === "preview") throw new StoreError("Connect Turso to save dashboard changes on Vercel.", 503);
    return await action(store);
  } catch (error) { return apiError(error); }
}

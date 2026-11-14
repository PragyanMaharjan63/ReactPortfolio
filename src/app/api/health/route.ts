import { getDatabase } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getDatabase();
    await store.ping();
    return Response.json({ status: "ok", database: "connected", engine: "sqlite", storage: store.storage, uptime: Math.round(process.uptime()), env: process.env.NODE_ENV });
  } catch (error) {
    console.error("[health] SQLite unavailable", error);
    return Response.json({ status: "error", database: "unavailable", engine: "sqlite" }, { status: 503 });
  }
}

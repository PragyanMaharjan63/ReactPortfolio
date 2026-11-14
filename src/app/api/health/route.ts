import { getDatabase } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try {
    getDatabase().prepare("SELECT 1").get();
    return Response.json({ status: "ok", database: "connected", engine: "sqlite", uptime: Math.round(process.uptime()), env: process.env.NODE_ENV });
  } catch (error) {
    console.error("[health] SQLite unavailable", error);
    return Response.json({ status: "error", database: "unavailable", engine: "sqlite" }, { status: 503 });
  }
}

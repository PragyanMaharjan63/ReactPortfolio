import { adminRoute } from "@/lib/admin-api";

export async function GET(request: Request) {
  return adminRoute(request, async (store) => new Response(JSON.stringify({ exportedAt: new Date().toISOString(), projects: (await store.list()).map((record) => record.project) }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="portfolio-projects.json"', "Cache-Control": "no-store" },
  }));
}

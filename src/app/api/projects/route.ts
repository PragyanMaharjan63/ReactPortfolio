import { getProjects } from "@/lib/projects";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ source: "database", database: "sqlite", projects: await getProjects() });
}

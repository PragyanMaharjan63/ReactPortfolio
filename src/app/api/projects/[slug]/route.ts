import { getProject } from "@/lib/projects";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return project
    ? Response.json({ source: "database", database: "sqlite", project })
    : Response.json({ error: "Project not found" }, { status: 404 });
}

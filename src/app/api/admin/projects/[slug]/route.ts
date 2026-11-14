import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminRoute, privateJson, readJson } from "@/lib/admin-api";
import { saveProjectSchema } from "@/lib/project-validation";

type Context = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: Context) {
  return adminRoute(request, async (store) => {
    const { slug } = await params;
    const result = saveProjectSchema.safeParse(await readJson(request));
    if (!result.success) return privateJson({ error: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n") }, 400);
    await store.update(slug, result.data.project, result.data.revision);
    revalidatePath("/", "layout");
    return privateJson({ records: await store.list() });
  });
}

export async function DELETE(request: Request, { params }: Context) {
  return adminRoute(request, async (store) => {
    const { slug } = await params;
    const body = z.object({ revision: z.string().min(1).max(100) }).strict().safeParse(await readJson(request));
    if (!body.success) return privateJson({ error: "Reload before deleting this project." }, 400);
    await store.delete(slug, body.data.revision);
    revalidatePath("/", "layout");
    return privateJson({ records: await store.list() });
  });
}

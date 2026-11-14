import { revalidatePath } from "next/cache";
import { adminRoute, privateJson, readJson } from "@/lib/admin-api";
import { projectSchema } from "@/lib/project-validation";

export async function GET(request: Request) {
  return adminRoute(request, async (store) => privateJson({ records: await store.list() }));
}

export async function POST(request: Request) {
  return adminRoute(request, async (store) => {
    const result = projectSchema.safeParse(await readJson(request));
    if (!result.success) return privateJson({ error: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n") }, 400);
    await store.create(result.data);
    revalidatePath("/", "layout");
    return privateJson({ records: await store.list() }, 201);
  });
}

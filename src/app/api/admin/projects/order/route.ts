import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminRoute, privateJson, readJson } from "@/lib/admin-api";

export async function POST(request: Request) {
  return adminRoute(request, async (store) => {
    const body = z.object({ slugs: z.array(z.string().min(1).max(80)).max(500) }).strict().safeParse(await readJson(request));
    if (!body.success) return privateJson({ error: "Invalid project order." }, 400);
    await store.reorder(body.data.slugs);
    revalidatePath("/", "layout");
    return privateJson({ records: await store.list() });
  });
}

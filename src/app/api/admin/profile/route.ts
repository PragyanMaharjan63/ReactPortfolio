import { revalidatePath } from "next/cache";
import { adminRoute, privateJson, readJson } from "@/lib/admin-api";
import { saveProfileSchema } from "@/lib/profile-validation";

export async function GET(request: Request) {
  return adminRoute(request, async (store) => privateJson({ record: await store.getProfile() }));
}

export async function PUT(request: Request) {
  return adminRoute(request, async (store) => {
    const result = saveProfileSchema.safeParse(await readJson(request));
    if (!result.success) return privateJson({ error: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n") }, 400);
    await store.saveProfile(result.data.profile, result.data.revision);
    revalidatePath("/", "layout");
    return privateJson({ record: await store.getProfile() });
  });
}

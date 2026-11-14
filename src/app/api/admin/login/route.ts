import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { getDatabase } from "@/lib/projects";
import { adminConfigured, checkPassword, createSession, SESSION_COOKIE, SESSION_SECONDS } from "@/lib/session";
import { sessionCookieOptions } from "@/lib/auth";
import { apiError, privateJson, readJson, requireSameOrigin } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (!adminConfigured()) return privateJson({ error: "Dashboard credentials have not been configured." }, 503);
    const parsed = z.object({ password: z.string().min(1).max(256) }).strict().safeParse(await readJson(request));
    if (!parsed.success) return privateJson({ error: "Enter your dashboard password." }, 400);
    const store = await getDatabase();
    if (store.storage === "preview") return privateJson({ error: "Connect Turso before signing into the dashboard on Vercel." }, 503);
    const ip = process.env.VERCEL === "1" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown" : "local";
    const key = createHash("sha256").update(ip).digest("hex");
    if (await store.loginBlocked(key)) return privateJson({ error: "Too many attempts. Try again in 15 minutes." }, 429);
    if (!checkPassword(parsed.data.password)) {
      await store.failedLogin(key);
      return privateJson({ error: "Incorrect password." }, 401);
    }
    await store.clearLoginAttempts(key);
    (await cookies()).set(SESSION_COOKIE, await createSession(), { ...sessionCookieOptions, maxAge: SESSION_SECONDS });
    return privateJson({ ok: true });
  } catch (error) { return apiError(error); }
}

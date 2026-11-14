import { cookies } from "next/headers";
import { sessionCookieOptions } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";
import { apiError, privateJson, requireSameOrigin } from "@/lib/admin-api";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    (await cookies()).set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
    return privateJson({ ok: true });
  } catch (error) { return apiError(error); }
}

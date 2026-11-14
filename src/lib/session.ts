import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "portfolio_admin";
export const SESSION_SECONDS = 8 * 60 * 60;

export function adminConfigured() {
  return (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12 && (process.env.ADMIN_PASSWORD?.length ?? 0) <= 256 && (process.env.AUTH_SECRET?.length ?? 0) >= 32;
}

function signingKey() {
  if (!adminConfigured()) throw new Error("Dashboard credentials are not configured.");
  // Rotating either credential invalidates all previously issued sessions.
  return createHash("sha256").update(`${process.env.AUTH_SECRET}\0${process.env.ADMIN_PASSWORD}`).digest();
}

export function checkPassword(password: string) {
  if (!adminConfigured() || password.length > 256) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(password), digest(process.env.ADMIN_PASSWORD!));
}

export async function createSession() {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" })
    .setSubject("admin").setIssuer("portfolio-dashboard").setAudience("portfolio-admin")
    .setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(signingKey());
}

export async function verifySession(token?: string) {
  if (!token || token.length > 2048 || !adminConfigured()) return false;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"], issuer: "portfolio-dashboard", audience: "portfolio-admin" });
    return payload.sub === "admin" && payload.role === "admin";
  } catch { return false; }
}

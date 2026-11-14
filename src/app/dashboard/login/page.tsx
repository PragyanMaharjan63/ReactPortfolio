import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { adminConfigured } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { SetupNotice } from "@/components/dashboard/SetupNotice";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!adminConfigured()) return <SetupNotice />;
  if (process.env.VERCEL === "1" && !process.env.TURSO_DATABASE_URL) return <SetupNotice database />;
  if (await isAdmin()) redirect("/dashboard");
  return (
    <div className="shell section min-h-[70vh]">
      <div className="panel mx-auto max-w-md p-7 sm:p-10">
        <div className="mb-7 flex items-center justify-between"><p className="label text-accent">The control room</p><LockKeyhole className="size-5 text-muted" aria-hidden="true" /></div>
        <h1 className="text-h2">Welcome back.</h1>
        <p className="mt-3 text-sm text-secondary">Sign in with your dashboard password to update projects.</p>
        <LoginForm />
      </div>
    </div>
  );
}

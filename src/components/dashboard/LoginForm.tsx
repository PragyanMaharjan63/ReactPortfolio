"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form className="mt-8 space-y-5" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setError("");
      try {
        const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not sign in.");
        router.replace("/dashboard"); router.refresh();
      } catch (error) { setError(error instanceof Error ? error.message : "Could not sign in."); }
      finally { setBusy(false); }
    }}>
      <label className="admin-field">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={256} autoFocus />
      </label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy} type="submit">
        {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <>Open dashboard <ArrowRight className="size-4" aria-hidden="true" /></>}
      </button>
      <p className="text-center text-xs text-muted">Use the password configured as ADMIN_PASSWORD. No username is required.</p>
    </form>
  );
}

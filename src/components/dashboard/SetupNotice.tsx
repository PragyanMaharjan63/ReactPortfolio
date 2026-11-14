export function SetupNotice({ database = false }: { database?: boolean }) {
  return (
    <div className="shell section min-h-[65vh]">
      <div className="panel mx-auto max-w-xl p-7 sm:p-10">
        <p className="label text-accent">Your private workspace</p>
        <h1 className="mt-5 text-h2">One small setup step.</h1>
        <p className="mt-5 text-secondary">
          {database ? "Connect your hosted SQLite database to keep dashboard edits persistent on Vercel." : "Set your dashboard credentials in .env.local or in Vercel’s environment variables, then restart or redeploy."}
        </p>
        <dl className="mt-7 space-y-4 text-sm">
          {database ? <>
            <div><dt className="font-mono text-accent">TURSO_DATABASE_URL</dt><dd className="mt-1 text-secondary">Your database’s libsql:// address.</dd></div>
            <div><dt className="font-mono text-accent">TURSO_AUTH_TOKEN</dt><dd className="mt-1 text-secondary">A token with read and write access.</dd></div>
          </> : <>
            <div><dt className="font-mono text-accent">ADMIN_PASSWORD</dt><dd className="mt-1 text-secondary">Choose your own password, 12–256 characters. This is the password you use to sign in; no login ID is needed.</dd></div>
            <div><dt className="font-mono text-accent">AUTH_SECRET</dt><dd className="mt-1 text-secondary">A random secret of at least 32 characters.</dd></div>
          </>}
        </dl>
        <p className="mt-7 text-sm text-muted">See the dashboard setup instructions in README.md. There are no default credentials.</p>
      </div>
    </div>
  );
}

import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

// Load the same production env files as Next's CLI, before the standalone
// server changes its cwd. Resolve SQLite against the repository, not .next/.
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require(require.resolve("@next/env", { paths: [require.resolve("next/package.json")] }));
loadEnvConfig(process.cwd(), false);
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME ?? "0.0.0.0",
    DATABASE_PATH: resolve(process.env.DATABASE_PATH ?? "./data/portfolio.sqlite"),
  },
});
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => child.kill(signal));
child.on("error", (error) => { console.error(error); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });

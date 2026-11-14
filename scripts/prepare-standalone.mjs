import { cpSync } from "node:fs";

// Next's standalone output deliberately omits static assets. Include them so
// the same server entry works with npm start and in the production container.
cpSync("public", ".next/standalone/public", { recursive: true });
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });

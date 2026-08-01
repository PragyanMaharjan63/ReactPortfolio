/**
 * Central environment access. Every variable is optional with a sane default,
 * so the app boots with no .env at all — MONGODB_URI simply switches the
 * content source from the bundled seed data to the database.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  hostname: process.env.HOSTNAME ?? "0.0.0.0",
  mongoUri: process.env.MONGODB_URI ?? "",
  siteUrl: process.env.SITE_URL ?? "https://maharjanpragyan.com.np",
  /** Absolute path to the built client. */
  clientDir: process.env.CLIENT_DIR ?? "",
} as const;

export const isProd = env.nodeEnv === "production";

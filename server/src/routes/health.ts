import { Router } from "express";
import { isDbConnected } from "../lib/db.js";
import { env } from "../env.js";

export const healthRouter: Router = Router();

/**
 * Liveness endpoint for Docker HEALTHCHECK and the Jenkins deploy gate.
 *
 * Returns 200 whenever the process can serve traffic. The database is
 * optional, so its state is reported but never fails the check — the site
 * serves bundled content without it.
 */
healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    database: isDbConnected() ? "connected" : "not-configured",
    env: env.nodeEnv,
  });
});

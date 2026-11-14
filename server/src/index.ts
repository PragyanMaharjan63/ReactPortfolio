import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { env, isProd } from "./env.js";
import { connectDb } from "./lib/db.js";
import { healthRouter } from "./routes/health.js";
import { projectsRouter } from "./routes/projects.js";
import { renderDocument } from "./render.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// dist/index.js -> ../../client/dist in the image, ../../../client/dist in dev.
const clientDir =
  env.clientDir ||
  [
    path.resolve(here, "../client"),
    path.resolve(here, "../../client/dist"),
  ].find((p) => existsSync(path.join(p, "index.html"))) ||
  path.resolve(here, "../client");

const app = express();

app.disable("x-powered-by");
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // 'wasm-unsafe-eval' is required by the glTF decoder that drei loads
        // for compressed meshes. It permits WebAssembly compilation only —
        // full 'unsafe-eval' is deliberately NOT granted.
        scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        // blob: is required — three.js compiles shaders and workers from blobs.
        imgSrc: ["'self'", "data:", "blob:"],
        workerSrc: ["'self'", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    // Models and textures are same-origin; COEP would break nothing here but
    // adds no value, so it stays off.
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use(cors({ origin: isProd ? env.siteUrl : true }));
app.use(express.json({ limit: "16kb" }));

app.use("/api", healthRouter);
app.use("/api", projectsRouter);

// Hashed build assets are immutable; everything else must revalidate.
app.use(
  "/assets",
  express.static(path.join(clientDir, "assets"), {
    immutable: true,
    maxAge: "1y",
    fallthrough: false,
  }),
);

app.use(
  express.static(clientDir, {
    index: false,
    maxAge: "1h",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
      }
    },
  }),
);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

/** App routes the SPA can render. Anything else is a genuine 404. */
const APP_ROUTES = [/^\/$/, /^\/work\/?$/, /^\/about\/?$/, /^\/contact\/?$/, /^\/projects\/[\w-]+\/?$/];

// SPA fallback with per-route metadata injected server side.
app.get(/.*/, async (req, res, next) => {
  // A request for a missing file (anything with an extension) must 404 rather
  // than returning index.html with a 200 — soft 404s get indexed as real pages.
  const looksLikeAsset = /\.[a-z0-9]{2,5}$/i.test(req.path);
  const isAppRoute = APP_ROUTES.some((r) => r.test(req.path));
  if (looksLikeAsset || !isAppRoute) {
    try {
      const html = await renderDocument(clientDir, req.path);
      res.status(404).type("html").send(html);
    } catch {
      res.status(404).type("txt").send("Not found");
    }
    return;
  }

  try {
    const html = await renderDocument(clientDir, req.path);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.status(200).send(html);
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: Error & { status?: number; statusCode?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    // express.static with fallthrough:false raises a 404-status error for a
    // missing asset. Honour it instead of reporting every miss as a 500.
    const status = error.status ?? error.statusCode ?? 500;
    if (status >= 500) console.error("[server] unhandled error:", error);
    res.status(status).json({
      error: status === 404 ? "Not found" : "Internal server error",
    });
  },
);

async function start(): Promise<void> {
  await connectDb();
  app.listen(env.port, env.hostname, () => {
    console.log(
      `[server] listening on http://${env.hostname}:${env.port} (${env.nodeEnv})`,
    );
    console.log(`[server] serving client from ${clientDir}`);
  });
}

start().catch((error) => {
  console.error("[server] failed to start:", error);
  process.exit(1);
});

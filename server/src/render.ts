import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "./env.js";
import { projects } from "./content/projects.js";

interface Seo {
  title: string;
  description: string;
}

const SITE_NAME = "Pragyan Maharjan";
const DEFAULT_DESC =
  "Pragyan Maharjan builds companion robotics prototypes and production web applications — 3D-printed hardware, embedded interaction loops, full-stack TypeScript, and containerised deployment.";

/**
 * Per-route metadata. A client-rendered SPA gives crawlers and link unfurlers
 * nothing useful, so the server rewrites the head before sending index.html.
 */
function seoFor(pathname: string): Seo {
  if (pathname === "/" || pathname === "") {
    return {
      title: `${SITE_NAME} — Robotics & Full-Stack Engineer`,
      description: DEFAULT_DESC,
    };
  }
  if (pathname.startsWith("/work")) {
    return {
      title: `Work — ${SITE_NAME}`,
      description: `Robotics prototypes and deployed web applications by ${SITE_NAME}.`,
    };
  }
  if (pathname.startsWith("/about")) {
    return { title: `About — ${SITE_NAME}`, description: DEFAULT_DESC };
  }
  if (pathname.startsWith("/contact")) {
    return {
      title: `Contact — ${SITE_NAME}`,
      description: `Get in touch with ${SITE_NAME} — robotics and full-stack engineering.`,
    };
  }
  if (pathname.startsWith("/projects/")) {
    const slug = pathname.split("/")[2];
    const project = projects.find((p) => p.slug === slug);
    if (project) {
      return {
        title: `${project.title} — ${SITE_NAME}`,
        description: String(project.summary ?? DEFAULT_DESC),
      };
    }
  }
  return { title: SITE_NAME, description: DEFAULT_DESC };
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

let template: string | null = null;
let renderApp: ((url: string) => string) | null = null;

async function loadTemplate(clientDir: string): Promise<string> {
  if (template) return template;
  template = await readFile(path.join(clientDir, "index.html"), "utf8");
  return template;
}

/** Returns index.html with the <!--SEO--> block replaced for this route. */
export async function renderDocument(
  clientDir: string,
  pathname: string,
): Promise<string> {
  const templateHtml = await loadTemplate(clientDir);
  const { title, description } = seoFor(pathname);
  const canonical = `${env.siteUrl}${pathname === "/" ? "" : pathname}`;

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ].join("\n    ");

  if (!renderApp) {
    const serverEntry = path.join(clientDir, "server", "entry-server.js");
    ({ render: renderApp } = (await import(serverEntry)) as {
      render: (url: string) => string;
    });
  }

  const body = renderApp(pathname);
  const html = templateHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${body}</div>`,
  );

  return html.replace(
    /<!--SEO-->[\s\S]*?<!--\/SEO-->/,
    `<!--SEO-->\n    ${head}\n    <!--/SEO-->`,
  );
}

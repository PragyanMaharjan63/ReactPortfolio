import data from "./projects.json" with { type: "json" };

/**
 * Bundled project content — generated from client/src/data/projects.ts by
 * `npm run sync:content`. Serves as the API's answer when MongoDB is not
 * configured or unreachable, so the endpoint always returns correct content.
 */
export interface BundledProject {
  slug: string;
  title: string;
  domain: string;
  [key: string]: unknown;
}

export const projects = data as unknown as BundledProject[];

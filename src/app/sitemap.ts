import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return ["/", "/work", "/about", "/contact", ...projects.map((project) => `/projects/${project.slug}`)]
    .map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "monthly", priority: path === "/" ? 1 : 0.7 }));
}

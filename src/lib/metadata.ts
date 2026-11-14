import type { Metadata } from "next";
import { site } from "@/data/site";

export const siteUrl = process.env.SITE_URL ?? site.url;

export function pageMetadata(title: string, description: string, path: string, image = "/media/yetibot/model.webp"): Metadata {
  const fullTitle = `${title} — ${site.name}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, type: "website", siteName: site.name, images: [{ url: image, alt: title }] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}

import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const link = text(2048).refine((value) => {
  if (!value) return true;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}, "Use a complete http:// or https:// URL.");
const asset = text(2048).refine((value) => !value || (/^\/(?!\/)/.test(value) && !value.includes("\\")) || /^https:\/\//.test(value), "Use a /media/ path or an https:// URL.");
const optionalAsset = asset.optional();

export const projectSchema = z.object({
  slug: text(80).min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens."),
  title: text(120).min(1, "A title is required."),
  category: z.enum(["Companion robotics", "Quadruped robotics", "Full-stack", "Frontend"]),
  year: text(4).regex(/^\d{4}$/, "Use a four-digit year."),
  summary: text(500).min(1, "A summary is required."),
  description: text(10000).min(1, "A description is required."),
  featured: z.boolean(),
  domain: z.enum(["robotics", "web"]),
  image: optionalAsset,
  imageAlt: text(500).optional(),
  model: optionalAsset,
  modelType: z.enum(["original", "cad-export", "visual-reconstruction", "placeholder"]).optional(),
  technologies: z.array(text(100).min(1)).max(50),
  role: text(500).min(1),
  status: text(200).optional(),
  links: z.object({ live: link.optional(), github: link.optional(), documentation: link.optional() }).strict(),
  gallery: z.array(z.object({ src: asset.min(1), alt: text(500) }).strict()).max(40).optional(),
  videos: z.array(z.object({ src: asset.min(1), poster: asset.min(1), label: text(200).min(1) }).strict()).max(20).optional(),
  metadata: z.array(z.object({ label: text(100).min(1), value: text(500) }).strict()).max(40).optional(),
  challenges: z.array(text(1000).min(1)).max(40).optional(),
  missingInfo: z.array(text(1000).min(1)).max(40).optional(),
}).strict();

export const saveProjectSchema = z.object({ project: projectSchema, revision: z.string().max(100).optional() }).strict();

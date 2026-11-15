import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const month = text(7).regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use a month like 2026-04.");
const year = text(4).regex(/^\d{4}$/, "Use a four-digit year.");
const link = text(2048).refine((value) => {
  if (!value) return true;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}, "Use a complete http:// or https:// URL.");

export const profileSchema = z.object({
  headline: text(160).min(1, "A headline is required."),
  bio: text(6000),
  experience: z.array(z.object({
    role: text(160).min(1, "Each role needs a title."),
    organisation: text(160).min(1, "Each role needs an organisation."),
    url: link.optional(),
    start: month,
    end: z.union([month, z.literal("")]).optional(),
    highlights: z.array(text(500).min(1)).max(20),
  }).strict().refine((entry) => !entry.end || entry.end >= entry.start, "An end date cannot be before the start date.")).max(30),
  skills: z.array(z.object({
    name: text(80).min(1, "Each skill group needs a name."),
    items: z.array(text(80).min(1)).max(30),
  }).strict()).max(12),
  languages: z.array(z.object({
    name: text(60).min(1, "Each language needs a name."),
    code: text(3).optional(),
  }).strict()).max(30),
  education: z.array(z.object({
    school: text(160).min(1, "Each school needs a name."),
    field: text(160).optional(),
    start: year,
    end: z.union([year, z.literal("")]).optional(),
  }).strict()).max(10),
}).strict();

export const saveProfileSchema = z.object({ profile: profileSchema, revision: z.string().max(100) }).strict();

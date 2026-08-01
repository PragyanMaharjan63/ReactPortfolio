import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * Content store for projects. The shape mirrors the client's Project type so
 * seeded documents drop straight into the UI.
 */
const linksSchema = new Schema(
  { live: String, github: String, documentation: String },
  { _id: false },
);

const metadataSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const gallerySchema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    caption: String,
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    year: { type: Number, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    featured: { type: Boolean, default: false },
    domain: { type: String, enum: ["robotics", "web"], required: true },
    image: String,
    imageAlt: String,
    mobileImage: String,
    gallery: [gallerySchema],
    model: String,
    modelType: String,
    technologies: [String],
    role: String,
    metadata: [metadataSchema],
    problem: String,
    challenges: [String],
    outcome: String,
    status: String,
    links: linksSchema,
    missingInfo: [String],
  },
  { timestamps: true, versionKey: false },
);

export type ProjectDoc = InferSchemaType<typeof projectSchema>;
export const ProjectModel = model("Project", projectSchema);

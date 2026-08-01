import mongoose from "mongoose";
import { env } from "./env.js";
import { ProjectModel } from "./models/Project.js";
import { projects } from "./content/projects.js";

/**
 * Loads the bundled project content into MongoDB. Idempotent — each project is
 * upserted by slug, so re-running updates rather than duplicating.
 *
 * Run: npm run seed  (requires MONGODB_URI)
 */
async function seed(): Promise<void> {
  if (!env.mongoUri) {
    console.error("MONGODB_URI is not set — nothing to seed.");
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log("[seed] connected");

  for (const project of projects) {
    await ProjectModel.updateOne({ slug: project.slug }, { $set: project }, {
      upsert: true,
    });
    console.log(`[seed] upserted ${project.slug}`);
  }

  const count = await ProjectModel.countDocuments();
  console.log(`[seed] done — ${count} projects in database`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("[seed] failed:", error);
  process.exit(1);
});

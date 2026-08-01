import { Router } from "express";
import { ProjectModel } from "../models/Project.js";
import { isDbConnected } from "../lib/db.js";
import { projects as bundledProjects } from "../content/projects.js";

export const projectsRouter: Router = Router();

/** All projects. Database first, bundled content when Mongo is absent. */
projectsRouter.get("/projects", async (_req, res) => {
  if (!isDbConnected()) {
    res.json({ source: "bundled", projects: bundledProjects });
    return;
  }

  try {
    const docs = await ProjectModel.find().sort({ year: -1, title: 1 }).lean();
    res.json({
      source: "database",
      projects: docs.length > 0 ? docs : bundledProjects,
    });
  } catch (error) {
    console.error("[projects] query failed:", error);
    res.json({ source: "bundled", projects: bundledProjects });
  }
});

projectsRouter.get("/projects/:slug", async (req, res) => {
  const { slug } = req.params;

  if (!isDbConnected()) {
    const found = bundledProjects.find((p) => p.slug === slug);
    if (!found) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json({ source: "bundled", project: found });
    return;
  }

  try {
    const doc = await ProjectModel.findOne({ slug }).lean();
    const fallback = bundledProjects.find((p) => p.slug === slug);
    const project = doc ?? fallback;
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json({ source: doc ? "database" : "bundled", project });
  } catch (error) {
    console.error("[projects] query failed:", error);
    res.status(500).json({ error: "Internal error" });
  }
});

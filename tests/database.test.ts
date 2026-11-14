import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase, readProject, readProjects, seedProjects } from "../src/lib/database";
import { projects } from "../src/data/projects";

test("SQLite initializes every project, including galleries, metadata and simulations", () => {
  const db = openDatabase(":memory:");
  try {
    assert.deepEqual(readProjects(db), projects);
    assert.equal(readProject(db, "yetibot")?.model, "/models/yetibot.glb");
    assert.equal(readProject(db, "quadruped")?.domain, "robotics");
  } finally { db.close(); }
});

test("runtime edits and deletions survive reopening the persistent database", () => {
  const directory = mkdtempSync(join(tmpdir(), "portfolio-db-"));
  try {
    const path = join(directory, "nested", "portfolio.sqlite");
    const db = openDatabase(path);
    const changed = { ...projects[0], title: "Edited in SQLite" };
    db.prepare("UPDATE projects SET document = ? WHERE slug = ?").run(JSON.stringify(changed), changed.slug);
    db.prepare("DELETE FROM projects WHERE slug = ?").run(projects[1].slug);
    db.close();
    const reopened = openDatabase(path);
    try {
      assert.equal(readProject(reopened, changed.slug)?.title, "Edited in SQLite");
      assert.equal(readProject(reopened, projects[1].slug), undefined);
      assert.equal(readProjects(reopened).length, projects.length - 1);
      assert.equal(reopened.prepare("PRAGMA integrity_check").get()?.integrity_check, "ok");
    } finally { reopened.close(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("explicit seeding refreshes content without duplicating records", () => {
  const db = openDatabase(":memory:");
  try {
    seedProjects(db);
    seedProjects(db);
    assert.deepEqual(readProjects(db), projects);
  } finally { db.close(); }
});

test("missing and hostile slugs cannot select other records", () => {
  const db = openDatabase(":memory:");
  try {
    assert.equal(readProject(db, "does-not-exist"), undefined);
    assert.equal(readProject(db, "' OR 1=1 --"), undefined);
    assert.equal(readProjects(db).length, projects.length);
  } finally { db.close(); }
});

import test from "node:test";
import assert from "node:assert/strict";
import { createProjectStore, initializeRemote, localConnection } from "../src/lib/storage";
import { projects } from "../src/data/projects";
import { projectSchema } from "../src/lib/project-validation";

test("dashboard CRUD preserves fields, rejects stale edits, and uses parameterized slugs", async () => {
  const local = localConnection(":memory:");
  const store = createProjectStore(local.connection);
  try {
    const first = (await store.get("yetibot"))!;
    const changed = { ...first.project, summary: "Changed through the dashboard" };
    await store.update("yetibot", changed, first.revision);
    assert.equal((await store.get("yetibot"))?.project.summary, changed.summary);
    assert.deepEqual((await store.get("yetibot"))?.project.gallery, first.project.gallery);
    await assert.rejects(store.update("yetibot", first.project, first.revision), /another tab/);
    await assert.rejects(store.delete("yetibot", first.revision), /another tab/);
    assert.equal(await store.get("' OR 1=1 --"), undefined);
    const added = { ...projects[2], slug: "dashboard-test", title: "Dashboard project" };
    await store.create(added);
    await assert.rejects(store.create(added), /already exists/);
    assert.equal((await store.list()).at(-1)?.project.slug, added.slug);
    const slugs = (await store.list()).map((record) => record.project.slug).reverse();
    await store.reorder(slugs);
    assert.deepEqual((await store.list()).map((record) => record.project.slug), slugs);
    await assert.rejects(store.reorder([slugs[0], slugs[0]]), /list changed/);
    const record = (await store.get(added.slug))!;
    await store.delete(added.slug, record.revision);
    assert.equal(await store.get(added.slug), undefined);
  } finally { local.close(); }
});

test("hosted initialization SQL is atomic and never restores deleted seed records", async () => {
  const local = localConnection(":memory:");
  try {
    await initializeRemote(local.connection);
    const store = createProjectStore(local.connection, "turso");
    const record = (await store.get("yetibot"))!;
    await store.delete("yetibot", record.revision);
    await initializeRemote(local.connection);
    assert.equal(await store.get("yetibot"), undefined);
    assert.equal((await store.list()).length, projects.length - 1);
  } finally { local.close(); }
});

test("login attempts are throttled in shared SQLite and reset after successful login", async () => {
  const local = localConnection(":memory:");
  const store = createProjectStore(local.connection);
  try {
    assert.equal(await store.loginBlocked("test-key"), false);
    for (let attempt = 0; attempt < 5; attempt++) await store.failedLogin("test-key");
    assert.equal(await store.loginBlocked("test-key"), true);
    await store.clearLoginAttempts("test-key");
    assert.equal(await store.loginBlocked("test-key"), false);
  } finally { local.close(); }
});

test("unconfigured Vercel preview is readable and rejects all project writes", async () => {
  const local = localConnection(":memory:");
  const store = createProjectStore(local.connection, "preview");
  try {
    assert.equal((await store.list()).length, projects.length);
    await assert.rejects(store.create(projects[0]), /Connect Turso/);
    await assert.rejects(store.seed(), /Connect Turso/);
    await assert.rejects(store.reorder([]), /Connect Turso/);
  } finally { local.close(); }
});

test("project input rejects executable links, unsafe slugs, and unknown data fields", () => {
  assert.equal(projectSchema.safeParse(projects[0]).success, true);
  assert.equal(projectSchema.safeParse({ ...projects[0], links: { live: "javascript:alert(1)" } }).success, false);
  assert.equal(projectSchema.safeParse({ ...projects[0], slug: "../bad" }).success, false);
  assert.equal(projectSchema.safeParse({ ...projects[0], unexpected: "field" }).success, false);
});

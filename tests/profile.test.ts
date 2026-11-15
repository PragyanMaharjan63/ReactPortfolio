import test from "node:test";
import assert from "node:assert/strict";
import { createProjectStore, localConnection } from "../src/lib/storage";
import { defaultProfile } from "../src/data/profile";
import { profileSchema } from "../src/lib/profile-validation";
import { formatRange, timeline } from "../src/lib/profile-format";

test("the profile starts from the defaults and saves with revision checks", async () => {
  const local = localConnection(":memory:");
  const store = createProjectStore(local.connection);
  try {
    const first = await store.getProfile();
    assert.deepEqual(first.profile, defaultProfile);
    const edited = { ...first.profile, headline: "Edited headline" };
    await store.saveProfile(edited, first.revision);
    const second = await store.getProfile();
    assert.equal(second.profile.headline, "Edited headline");
    assert.notEqual(second.revision, first.revision);
    await assert.rejects(store.saveProfile(first.profile, first.revision), /another tab/);
    await store.saveProfile({ ...edited, headline: "Again" }, second.revision);
    assert.equal((await store.getProfile()).profile.headline, "Again");
  } finally { local.close(); }
});

test("profile validation accepts the defaults and rejects bad dates", () => {
  assert.equal(profileSchema.safeParse(defaultProfile).success, true);
  const backwards = { ...defaultProfile, experience: [{ ...defaultProfile.experience[2], start: "2026-07", end: "2025-11" }] };
  assert.equal(profileSchema.safeParse(backwards).success, false);
  const badMonth = { ...defaultProfile, experience: [{ ...defaultProfile.experience[0], start: "April 2026" }] };
  assert.equal(profileSchema.safeParse(badMonth).success, false);
});

test("timeline bars sit on a shared month axis", () => {
  const now = 2026 * 12 + 10; // Nov 2026
  const { bars, nowAt } = timeline(defaultProfile.experience, now);
  const club = bars.find((bar) => bar.entry.organisation === "Smaterr Roboticz Club")!;
  const avernek = bars.find((bar) => bar.entry.organisation === "Avernek Technologies")!;
  assert.ok(club.left < avernek.left);
  assert.ok(avernek.left + avernek.width <= 100 && nowAt < 100);
  assert.equal(formatRange(defaultProfile.experience[0]), "Apr 2026 — Present");
});

test("the hero word is optional for older saved profiles but never empty", () => {
  const older: Partial<typeof defaultProfile> = { ...defaultProfile };
  delete older.heroWord;
  assert.equal(profileSchema.safeParse(older).success, true);
  assert.equal(profileSchema.safeParse({ ...defaultProfile, heroWord: "" }).success, false);
  assert.equal(profileSchema.safeParse({ ...defaultProfile, heroWord: "A".repeat(17) }).success, false);
  assert.equal(defaultProfile.experience.find((entry) => entry.organisation === "Avernek Technologies")?.url, "https://avernek.com");
  assert.equal(defaultProfile.experience.find((entry) => entry.organisation === "Aafno Store")?.url, "https://aafnostore.com");
});

test("a profile saved before websites existed gets them filled; a cleared website stays cleared", async () => {
  const local = localConnection(":memory:");
  const store = createProjectStore(local.connection);
  try {
    const first = await store.getProfile();
    // Exactly what the live database held: roles saved with no url key at all.
    const legacy = { ...first.profile, experience: first.profile.experience.map((entry) => { const copy = { ...entry }; delete copy.url; return copy; }) };
    await store.saveProfile(legacy, first.revision);
    const filled = await store.getProfile();
    const url = (name: string) => filled.profile.experience.find((entry) => entry.organisation === name)?.url;
    assert.equal(url("Avernek Technologies"), "https://avernek.com");
    assert.equal(url("Aafno Store"), "https://aafnostore.com");
    assert.equal(url("Smaterr Roboticz Club"), undefined);

    // Clearing the field in the dashboard saves "", which must not be refilled.
    const cleared = { ...filled.profile, experience: filled.profile.experience.map((entry) => entry.organisation === "Aafno Store" ? { ...entry, url: "" } : entry) };
    await store.saveProfile(cleared, filled.revision);
    assert.equal((await store.getProfile()).profile.experience.find((entry) => entry.organisation === "Aafno Store")?.url, "");
  } finally { local.close(); }
});

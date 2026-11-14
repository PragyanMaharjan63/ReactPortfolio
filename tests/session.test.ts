import test from "node:test";
import assert from "node:assert/strict";
import { adminConfigured, checkPassword, createSession, verifySession } from "../src/lib/session";

test("dashboard sessions require configuration, reject tampering and rotate with credentials", async () => {
  const originalPassword = process.env.ADMIN_PASSWORD;
  const originalSecret = process.env.AUTH_SECRET;
  try {
    delete process.env.ADMIN_PASSWORD; delete process.env.AUTH_SECRET;
    assert.equal(adminConfigured(), false);
    assert.equal(await verifySession("anything"), false);
    process.env.ADMIN_PASSWORD = "test-password-for-session-only";
    process.env.AUTH_SECRET = "test-secret-for-session-tests-only-32-characters";
    assert.equal(adminConfigured(), true);
    assert.equal(checkPassword("incorrect"), false);
    assert.equal(checkPassword(process.env.ADMIN_PASSWORD), true);
    const session = await createSession();
    assert.equal(await verifySession(session), true);
    assert.equal(await verifySession(`${session.slice(0, -10)}tampered`), false);
    process.env.ADMIN_PASSWORD = "a-different-test-password";
    assert.equal(await verifySession(session), false);
  } finally {
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = originalPassword;
    if (originalSecret === undefined) delete process.env.AUTH_SECRET; else process.env.AUTH_SECRET = originalSecret;
  }
});

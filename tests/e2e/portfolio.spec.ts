import { test, expect } from "@playwright/test";

test("pages, navigation and metadata survive the framework migration", async ({ page, request, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("#hero-heading")).toBeVisible();
  await expect(page).toHaveTitle(/Robotics.*Pragyan Maharjan/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/maharjanpragyan\.com\.np\/?$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL("/work");
  await expect(page.getByRole("heading", { name: "Everything, in one place" })).toBeVisible();
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#mobile-menu").getByRole("link", { name: "About", exact: true }).click();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  } else {
    await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "About", exact: true }).click();
  }
  await expect(page).toHaveURL("/about");
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Get in touch" })).toBeVisible();
  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  expect(await health.json()).toMatchObject({ status: "ok", engine: "sqlite", database: "connected" });
  const projects = await request.get("/api/projects");
  const data = await projects.json();
  expect(data.database).toBe("sqlite");
  expect(data.projects.length).toBeGreaterThan(2);
  for (const project of data.projects) {
    const response = await request.get(`/projects/${project.slug}`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(project.title);
  }
  expect((await request.get("/api/projects/unknown-project")).status()).toBe(404);
  expect((await request.get("/unknown-page")).status()).toBe(404);
  expect((await request.get("/projects/unknown-project")).status()).toBe(404);
  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  expect(errors).toEqual([]);
});

test("quadruped renders the model and executes its original WASM gait", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const wasm = page.waitForResponse((response) => response.url().endsWith("/sim/gait.wasm") && response.ok());
  await page.goto("/projects/quadruped");
  await page.getByRole("heading", { name: "3D", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.locator("canvas").first()).toBeVisible();
  await wasm;
  await page.getByRole("button", { name: "Forward", exact: true }).click();
  await expect(page.getByRole("button", { name: "Forward", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("FL Coxa", { exact: true })).toBeVisible();
  const angles = page.locator(".tabular-nums");
  const initialAngles = await angles.allTextContents();
  await expect.poll(async () => (await angles.allTextContents()).join(",")).not.toBe(initialAngles.join(","));
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await page.getByRole("button", { name: "Pause automatic rotation" }).click();
  await expect(page.getByRole("button", { name: "Resume automatic rotation" })).toBeVisible();
  await page.getByRole("button", { name: "Reset camera view" }).click();
  expect(errors).toEqual([]);
});

test("YetiBot keeps its animated firmware display and touch interactions", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const wasm = page.waitForResponse((response) => response.url().endsWith("/sim/yeti.wasm") && response.ok());
  await page.goto("/projects/yetibot");
  await page.getByRole("heading", { name: "3D", exact: true }).scrollIntoViewIfNeeded();
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  await wasm;
  await expect(page.getByText("starting…", { exact: true })).toHaveCount(0);
  await expect.poll(async () => page.getByText(/^frame \d+$/).textContent()).not.toBe("frame 0");
  // The shell itself is the touch target, matching the physical robot.
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  await canvas.click({ position: { x: bounds!.width / 2, y: bounds!.height / 2 }, clickCount: 3, delay: 60 });
  await expect(page.getByText("Menu", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pause automatic rotation" }).click();
  await expect(page.getByRole("button", { name: "Resume automatic rotation" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("reduced-motion and missing-WebGL visitors retain usable content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/yetibot");
  await page.getByRole("heading", { name: "3D", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Resume automatic rotation" })).toBeVisible();
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.reload();
  await expect(page.getByText("3D viewer unavailable — showing a project photograph.")).toBeVisible();
});

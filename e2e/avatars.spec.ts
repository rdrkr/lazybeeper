// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady } from "./helpers.js";

test.describe("Avatar images", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    /* Wait for React effects to run and create overlays. */
    await page.waitForTimeout(1000);
  });

  test("avatar overlay container is created", async ({ page }) => {
    const container = page.locator("#kitty-overlay-container");
    await expect(container).toBeAttached();
  });

  test("avatar images are rendered for chats with avatarPath", async ({ page }) => {
    const images = page.locator("#kitty-overlay-container img");
    const count = await images.count();
    /* Alice, Bob, Carol have avatarPaths in mock data. */
    expect(count).toBeGreaterThan(0);
  });

  test("avatar images have correct src paths", async ({ page }) => {
    const images = page.locator("#kitty-overlay-container img");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src");
      expect(src).toMatch(/\/avatars\/(alice|bob|carol)\.png$/);
    }
  });

  test("avatar images are positioned absolutely within viewport", async ({ page }) => {
    const images = page.locator("#kitty-overlay-container img");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await images.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    }
  });

  test("avatar image files load without errors", async ({ page }) => {
    const images = page.locator("#kitty-overlay-container img");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src");
      expect(src).toBeTruthy();
      /* Verify the image file is fetchable and returns a valid image. */
      const response = await page.request.get(`http://localhost:3100${src!}`);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image");
    }
  });

  test("avatar files are served by the web server", async ({ page }) => {
    for (const name of ["alice", "bob", "carol"]) {
      const response = await page.request.get(`/avatars/${name}.png`);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");
    }
  });
});

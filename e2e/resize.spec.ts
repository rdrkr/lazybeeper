// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady } from "./helpers.js";

test.describe("Responsive layout", () => {
  test("app renders at small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 400 });
    await page.goto("/");
    await waitForAppReady(page);

    await expect(page.getByText("Accounts [1]")).toBeVisible();
    await expect(page.getByText("Chats [2]")).toBeVisible();
  });

  test("app renders at large viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await waitForAppReady(page);

    await expect(page.getByText("Accounts [1]")).toBeVisible();
    await expect(page.getByText("Chats [2]")).toBeVisible();
    await expect(page.getByText("MOCK")).toBeVisible();
  });

  test("status bar stays visible after resize", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    await page.setViewportSize({ width: 900, height: 500 });
    await page.waitForTimeout(500);

    const mockLabel = page.getByText("MOCK");
    await expect(mockLabel).toBeVisible();
    const box = await mockLabel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(500);
  });

  test("layout adjusts panels after resize", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    await page.setViewportSize({ width: 1000, height: 600 });
    await page.waitForTimeout(500);

    await expect(page.getByText("Accounts [1]")).toBeVisible();
    await expect(page.getByText("MOCK")).toBeVisible();
  });
});

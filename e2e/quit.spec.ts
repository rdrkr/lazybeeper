// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady, pressKey } from "./helpers.js";

test.describe("Quit behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("q quits the app and shows closed message", async ({ page }) => {
    await pressKey(page, "q");
    await page.waitForTimeout(300);
    await expect(page.getByText("lazybeeper closed")).toBeVisible();
    await expect(page.getByText("Refresh to restart")).toBeVisible();
  });

  test("single Ctrl+C shows warning, does not quit", async ({ page }) => {
    await page.keyboard.down("Control");
    await page.keyboard.press("c");
    await page.keyboard.up("Control");
    await page.waitForTimeout(200);
    /* Should show warning, not quit. */
    const text = await page.locator("#root").textContent();
    expect(text).toContain("Ctrl-C");
    /* App should still be running (panels visible). */
    expect(text).toContain("Accounts");
  });

  test("double Ctrl+C quits the app", async ({ page }) => {
    /* First Ctrl+C. */
    await page.keyboard.down("Control");
    await page.keyboard.press("c");
    await page.keyboard.up("Control");
    await page.waitForTimeout(100);

    /* Second Ctrl+C within window. */
    await page.keyboard.down("Control");
    await page.keyboard.press("c");
    await page.keyboard.up("Control");
    await page.waitForTimeout(300);

    await expect(page.getByText("lazybeeper closed")).toBeVisible();
  });
});

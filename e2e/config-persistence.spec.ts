// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady, getPageText, pressKey, resetApp } from "./helpers.js";

test.describe("Config persistence via localStorage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await resetApp(page);
  });

  test("default config is applied on fresh load", async ({ page }) => {
    await pressKey(page, "c");
    const text = await getPageText(page);
    expect(text).toContain("Catppuccin Mocha");
    expect(text).toContain("enter");
    expect(text).toContain("comfortable");
    expect(text).toContain("modern");
  });

  test("chat list style persists across reload", async ({ page }) => {
    /* Toggle chat list to compact. */
    await pressKey(page, "c");
    await pressKey(page, "j"); /* Selection Mode */
    await pressKey(page, "j"); /* Chat List */
    await pressKey(page, "Enter"); /* Toggle to compact */
    await pressKey(page, "Escape");
    await page.waitForTimeout(200);

    await page.reload();
    await waitForAppReady(page);

    await pressKey(page, "c");
    const text = await getPageText(page);
    expect(text).toContain("compact");
  });

  test("theme change persists across reload", async ({ page }) => {
    /* Open config → theme → navigate to Dracula and apply. */
    await pressKey(page, "c");
    await pressKey(page, "Enter"); /* Theme popup */
    await page.waitForTimeout(200);

    /* Navigate to Dracula. */
    for (let i = 0; i < 6; i++) await pressKey(page, "j");
    await pressKey(page, "Enter"); /* Apply */
    await pressKey(page, "Escape"); /* Close config */
    await page.waitForTimeout(200);

    await page.reload();
    await waitForAppReady(page);

    await pressKey(page, "c");
    const text = await getPageText(page);
    expect(text).toContain("Dracula");
  });

  test("reset to defaults restores default config", async ({ page }) => {
    /* Change chat list to compact. */
    await pressKey(page, "c");
    await pressKey(page, "j");
    await pressKey(page, "j");
    await pressKey(page, "Enter"); /* compact */
    await page.waitForTimeout(200);

    /* Navigate to Reset to Defaults (index 4). */
    await pressKey(page, "j"); /* Style */
    await pressKey(page, "j"); /* Reset */
    await pressKey(page, "Enter");
    await page.waitForTimeout(200);

    /* Confirm reset. */
    await pressKey(page, "y");
    await page.waitForTimeout(500);

    /* Open config to verify defaults. */
    await pressKey(page, "c");
    const text = await getPageText(page);
    expect(text).toContain("comfortable");
    expect(text).toContain("Catppuccin Mocha");
  });
});

// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady, getPageText } from "./helpers.js";

test.describe("App loading", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("renders all four panel titles", async ({ page }) => {
    await expect(page.getByText("Accounts [1]")).toBeVisible();
    await expect(page.getByText("Chats [2]")).toBeVisible();
    /* Messages panel title includes chat name when auto-selected. */
    await expect(page.getByText("[3]")).toBeVisible();
    await expect(page.getByText("Input [4]")).toBeVisible();
  });

  test("renders status bar with MOCK label", async ({ page }) => {
    await expect(page.getByText("MOCK")).toBeVisible();
  });

  test("renders status bar keybinding hints", async ({ page }) => {
    const text = await getPageText(page);
    expect(text).toContain("search");
    expect(text).toContain("help");
    expect(text).toContain("quit");
  });

  test("renders mock account list", async ({ page }) => {
    const text = await getPageText(page);
    expect(text).toContain("iMessage");
    expect(text).toContain("Slack");
    expect(text).toContain("Signal");
    expect(text).toContain("WhatsApp");
  });

  test("renders chat list for default account", async ({ page }) => {
    const text = await getPageText(page);
    expect(text).toContain("Alice");
  });

  test("status bar is visible within viewport", async ({ page }) => {
    const mockLabel = page.getByText("MOCK");
    const box = await mockLabel.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  });

  test("text lines are flush without gaps", async ({ page }) => {
    /*
     * Find adjacent tui-text elements within a single panel's tui-box
     * and verify they pack tightly (no inter-line gaps).
     * Scope to the Accounts panel which has a known, tight column of text.
     */
    const panelBoxes = page.locator(".tui-box");
    const panelCount = await panelBoxes.count();
    let checked = 0;

    for (let p = 0; p < panelCount; p++) {
      const textLines = panelBoxes.nth(p).locator("> .tui-text");
      const lineCount = await textLines.count();
      if (lineCount < 3) continue;

      for (let i = 0; i < Math.min(lineCount - 1, 10); i++) {
        const current = await textLines.nth(i).boundingBox();
        const next = await textLines.nth(i + 1).boundingBox();
        if (!current || !next) continue;
        /* Only check elements in the same column (same x). */
        if (Math.abs(current.x - next.x) > 2) continue;
        /* Adjacent lines should be flush within 2px (sub-pixel rounding tolerance). */
        const gap = Math.abs(next.y - (current.y + current.height));
        expect(gap).toBeLessThanOrEqual(2);
        checked++;
      }
      if (checked > 0) break;
    }
    expect(checked).toBeGreaterThan(0);
  });
});

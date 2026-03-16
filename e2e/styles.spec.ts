// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady, pressKey, resetApp } from "./helpers.js";

test.describe("Visual styles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await resetApp(page);
  });

  test("modern style applies background colors to panels", async ({ page }) => {
    /* Default is modern. Look for tui-box elements with backgroundColor. */
    const hasBg = await page.evaluate(() => {
      const boxes = document.querySelectorAll(".tui-box");
      for (const box of boxes) {
        const bg = window.getComputedStyle(box).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          return true;
        }
      }
      return false;
    });
    expect(hasBg).toBe(true);
  });

  test("retro style applies visible borders to panels", async ({ page }) => {
    /* Switch to retro style. */
    await pressKey(page, "c");
    await pressKey(page, "j");
    await pressKey(page, "j");
    await pressKey(page, "j"); /* Style */
    await pressKey(page, "Enter"); /* Toggle to retro */
    await pressKey(page, "Escape");
    await page.waitForTimeout(300);

    const hasBorder = await page.evaluate(() => {
      const boxes = document.querySelectorAll(".tui-box");
      for (const box of boxes) {
        const style = window.getComputedStyle(box);
        if (style.borderStyle !== "none" && style.borderWidth !== "0px") {
          return true;
        }
      }
      return false;
    });
    expect(hasBorder).toBe(true);
  });

  test("switching to compact changes chat entry density", async ({ page }) => {
    /* Count chat-related tui-text elements in comfortable (default). */
    const countBefore = await page.locator(".tui-text").count();

    /* Switch to compact. */
    await pressKey(page, "c");
    await pressKey(page, "j");
    await pressKey(page, "j"); /* Chat List */
    await pressKey(page, "Enter"); /* compact */
    await pressKey(page, "Escape");
    await page.waitForTimeout(300);

    const countAfter = await page.locator(".tui-text").count();
    /* Compact mode should have fewer text lines (2 per chat vs 4). */
    expect(countAfter).toBeLessThan(countBefore);
  });

  test("comfortable mode renders larger avatar overlays", async ({ page }) => {
    /* Default is comfortable. Check avatar dimensions. */
    await page.waitForTimeout(1000);
    const images = page.locator("#kitty-overlay-container img");
    const count = await images.count();
    if (count > 0) {
      const height = await images.first().evaluate(
        (el) => parseFloat(window.getComputedStyle(el).height),
      );
      /* Comfortable avatars: 3 rows tall. Each row ~19.6px = ~59px total. */
      expect(height).toBeGreaterThan(30);
    }
  });
});

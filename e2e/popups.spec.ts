// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady, getPageText, pressKey } from "./helpers.js";

test.describe("Search popup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("/ opens search popup with input", async ({ page }) => {
    await pressKey(page, "/");
    await expect(page.getByText("Search", { exact: true })).toBeVisible();
    /* The search input should be present. */
    const searchInput = page.locator("input[placeholder='Search chats...']");
    await expect(searchInput).toBeVisible();
  });

  test("typing in search filters chat results", async ({ page }) => {
    await pressKey(page, "/");
    const searchInput = page.locator("input[placeholder='Search chats...']");
    await searchInput.fill("alice");
    await page.waitForTimeout(300);
    const text = await getPageText(page);
    expect(text).toContain("Alice");
  });

  test("Enter selects search result and shows messages", async ({ page }) => {
    await pressKey(page, "/");
    const searchInput = page.locator("input[placeholder='Search chats...']");
    await searchInput.fill("bob");
    await page.waitForTimeout(300);
    await pressKey(page, "Enter");
    await page.waitForTimeout(500);
    const text = await getPageText(page);
    expect(text).toContain("See you tomorrow");
  });

  test("Escape closes search popup", async ({ page }) => {
    await pressKey(page, "/");
    await expect(page.getByText("Search", { exact: true })).toBeVisible();
    await pressKey(page, "Escape");
    await page.waitForTimeout(300);
    /* Search popup gone — MOCK label should be visible on status bar. */
    await expect(page.getByText("MOCK")).toBeVisible();
  });

  test("shows No results when search has no matches", async ({ page }) => {
    await pressKey(page, "/");
    const searchInput = page.locator("input[placeholder='Search chats...']");
    await searchInput.fill("zzzznonexistent");
    await page.waitForTimeout(300);
    const text = await getPageText(page);
    expect(text).toContain("No results");
  });
});

test.describe("Help popup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("? opens help popup with keybindings", async ({ page }) => {
    await pressKey(page, "Shift+/");
    await expect(page.getByText("Keybindings")).toBeVisible();
  });

  test("shows all keybinding sections", async ({ page }) => {
    await pressKey(page, "Shift+/");
    const text = await getPageText(page);
    expect(text).toContain("Global");
    expect(text).toContain("Lists");
    expect(text).toContain("Input");
  });

  test("Escape closes help popup", async ({ page }) => {
    await pressKey(page, "Shift+/");
    await expect(page.getByText("Keybindings")).toBeVisible();
    await pressKey(page, "Escape");
    await page.waitForTimeout(300);
    await expect(page.getByText("MOCK")).toBeVisible();
  });
});

test.describe("Config popup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("c opens config popup", async ({ page }) => {
    await pressKey(page, "c");
    await expect(page.getByText("Configuration")).toBeVisible();
  });

  test("shows all config entries with values", async ({ page }) => {
    await pressKey(page, "c");
    const text = await getPageText(page);
    expect(text).toContain("Theme");
    expect(text).toContain("Selection Mode");
    expect(text).toContain("Chat List");
    expect(text).toContain("Style");
    expect(text).toContain("Reset to Defaults");
    /* Default values (display names). */
    expect(text).toContain("Catppuccin Mocha");
    expect(text).toContain("enter");
    expect(text).toContain("comfortable");
    expect(text).toContain("modern");
  });

  test("Escape closes config popup", async ({ page }) => {
    await pressKey(page, "c");
    await pressKey(page, "Escape");
    await page.waitForTimeout(200);
    await expect(page.getByText("MOCK")).toBeVisible();
  });

  test("Enter on Selection Mode toggles value", async ({ page }) => {
    await pressKey(page, "c");
    await pressKey(page, "j"); /* Selection Mode entry */
    await pressKey(page, "Enter");
    await page.waitForTimeout(200);
    const text = await getPageText(page);
    expect(text).toContain("navigate");
  });

  test("Enter on Chat List toggles value", async ({ page }) => {
    await pressKey(page, "c");
    await pressKey(page, "j");
    await pressKey(page, "j"); /* Chat List entry */
    await pressKey(page, "Enter");
    await page.waitForTimeout(200);
    const text = await getPageText(page);
    expect(text).toContain("compact");
  });

  test("Enter on Style toggles value", async ({ page }) => {
    await pressKey(page, "c");
    await pressKey(page, "j");
    await pressKey(page, "j");
    await pressKey(page, "j"); /* Style entry */
    await pressKey(page, "Enter");
    await page.waitForTimeout(200);
    const text = await getPageText(page);
    expect(text).toContain("retro");
  });

  test("Enter on Theme opens theme popup", async ({ page }) => {
    await pressKey(page, "c");
    await pressKey(page, "Enter"); /* Theme is index 0 */
    await page.waitForTimeout(200);
    await expect(page.getByText("Themes")).toBeVisible();
  });

  test("Enter on Reset to Defaults opens confirm", async ({ page }) => {
    await pressKey(page, "c");
    for (let i = 0; i < 4; i++) await pressKey(page, "j");
    await pressKey(page, "Enter");
    await page.waitForTimeout(200);
    await expect(page.getByText("Confirm")).toBeVisible();
    const text = await getPageText(page);
    expect(text).toContain("Reset all settings");
  });
});

test.describe("Theme popup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pressKey(page, "c");
    await pressKey(page, "Enter"); /* Open theme popup */
    await page.waitForTimeout(200);
  });

  test("shows theme list with current theme", async ({ page }) => {
    await expect(page.getByText("Themes")).toBeVisible();
    const text = await getPageText(page);
    expect(text).toContain("Catppuccin Mocha");
  });

  test("j/k navigates themes with live preview", async ({ page }) => {
    /* Navigate down — theme should change on screen. */
    await pressKey(page, "j");
    await page.waitForTimeout(100);
    /* The theme list should still be visible. */
    await expect(page.getByText("Themes")).toBeVisible();
  });

  test("Enter applies selected theme", async ({ page }) => {
    /* Navigate to a different theme and apply it. */
    for (let i = 0; i < 6; i++) await pressKey(page, "j");
    await pressKey(page, "Enter");
    await page.waitForTimeout(300);
    /* Back on config popup — theme should have changed. */
    const text = await getPageText(page);
    expect(text).toContain("Dracula");
  });

  test("Escape reverts theme preview", async ({ page }) => {
    await pressKey(page, "j");
    await pressKey(page, "j");
    await pressKey(page, "Escape");
    await page.waitForTimeout(200);
    /* Should revert to original theme. */
    const text = await getPageText(page);
    expect(text).toContain("Catppuccin Mocha");
  });
});

test.describe("Confirm popup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pressKey(page, "Tab"); /* Chats */
    await pressKey(page, "a"); /* Archive on first chat */
    await page.waitForTimeout(200);
  });

  test("shows confirm dialog with Yes/No", async ({ page }) => {
    const text = await getPageText(page);
    expect(text).toContain("Confirm");
    expect(text).toContain("Yes");
    expect(text).toContain("No");
  });

  test("n dismisses confirm popup", async ({ page }) => {
    await pressKey(page, "n");
    await page.waitForTimeout(200);
    await expect(page.getByText("MOCK")).toBeVisible();
  });

  test("Escape dismisses confirm popup", async ({ page }) => {
    await pressKey(page, "Escape");
    await page.waitForTimeout(200);
    await expect(page.getByText("MOCK")).toBeVisible();
  });

  test("y confirms the action", async ({ page }) => {
    await pressKey(page, "y");
    await page.waitForTimeout(200);
    await expect(page.getByText("MOCK")).toBeVisible();
  });
});

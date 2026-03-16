// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady, getPageText, pressKey } from "./helpers.js";

test.describe("Messages panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("auto-selects first chat and shows messages on load", async ({ page }) => {
    /*
     * In default config (enter mode), the app loads the "All" virtual account
     * and should show messages for the first chat automatically.
     */
    const text = await getPageText(page);
    expect(text).toContain("Alice");
    expect(text).toContain("Want to grab lunch?");
  });

  test("displays messages with sender names", async ({ page }) => {
    /* Wait for messages to load (async fetch after initial render). */
    await expect(page.getByText("Want to grab lunch?").first()).toBeVisible({ timeout: 5_000 });
    const text = await getPageText(page);
    expect(text).toContain("Alice");
    expect(text).toContain("You");
  });

  test("displays message timestamps in HH:MM format", async ({ page }) => {
    /* Timestamps are rendered as spans inside tui-text divs. */
    const allSpans = page.locator("span");
    const count = await allSpans.count();
    let foundTimestamp = false;
    for (let i = 0; i < count; i++) {
      const text = await allSpans.nth(i).textContent();
      if (text && /\d{1,2}:\d{2}/.test(text)) {
        foundTimestamp = true;
        break;
      }
    }
    expect(foundTimestamp).toBe(true);
  });

  test("j/k scrolls messages when panel is focused", async ({ page }) => {
    await pressKey(page, "3"); /* Focus Messages */
    await pressKey(page, "j");
    await pressKey(page, "j");
    /* Messages should still render (scroll doesn't break). */
    const textAfter = await getPageText(page);
    expect(textAfter).toContain("Alice");
  });

  test("Enter in Messages focuses Input", async ({ page }) => {
    await pressKey(page, "3"); /* Focus Messages */
    await pressKey(page, "Enter");
    const input = page.locator(".tui-input");
    await expect(input).toBeFocused();
  });

  test("switching accounts changes displayed messages", async ({ page }) => {
    /* Select Slack account (index 2). */
    await pressKey(page, "1"); /* Accounts panel */
    await pressKey(page, "j"); /* iMessage */
    await pressKey(page, "j"); /* Slack */
    await pressKey(page, "Enter");
    await page.waitForTimeout(300);
    /* Select first Slack chat. */
    await pressKey(page, "Enter");
    await page.waitForTimeout(300);
    const text = await getPageText(page);
    expect(text).toContain("#general");
    expect(text).toContain("Welcome");
  });
});

test.describe("Input panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pressKey(page, "4"); /* Focus Input panel */
  });

  test("can type in the input field", async ({ page }) => {
    const input = page.locator(".tui-input");
    await input.fill("Hello world!");
    await expect(input).toHaveValue("Hello world!");
  });

  test("Enter sends message and clears input", async ({ page }) => {
    const input = page.locator(".tui-input");
    await input.fill("Test message from e2e");
    await pressKey(page, "Enter");
    /* Input should be cleared. */
    await expect(input).toHaveValue("");
    /* Message should appear in the messages panel. */
    await page.waitForTimeout(500);
    const text = await getPageText(page);
    expect(text).toContain("Test message from e2e");
  });

  test("Escape from Input returns focus away from input", async ({ page }) => {
    const input = page.locator(".tui-input");
    await expect(input).toBeFocused();
    await pressKey(page, "Escape");
    /* Input element is unmounted when InputPanel loses focus. */
    await expect(input).toHaveCount(0);
  });

  test("placeholder text shown when input is empty", async ({ page }) => {
    const input = page.locator(".tui-input");
    const placeholder = await input.getAttribute("placeholder");
    expect(placeholder).toBe("Type a message...");
  });
});

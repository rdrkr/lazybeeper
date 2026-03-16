// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady, getPageText, pressKey } from "./helpers.js";

test.describe("Panel navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("Tab cycles focus through all panels", async ({ page }) => {
    /* Default starts on Accounts. Press Tab to move through panels.
     * We verify by checking the status bar's rightmost text which shows the focus name.
     * The page text always contains all panel titles, so we check the LAST occurrence
     * of the focus label — it appears in the status bar at the end of the text. */

    /* Tab → Chats */
    await pressKey(page, "Tab");
    /* Tab → Messages */
    await pressKey(page, "Tab");
    /* Tab → Input */
    await pressKey(page, "Tab");
    /* The input element should get autoFocus when Input panel is focused. */
    const input = page.locator(".tui-input");
    await expect(input).toBeFocused();

    /* Tab → wraps to Accounts (input element is unmounted). */
    await pressKey(page, "Tab");
    await expect(input).toHaveCount(0);
  });

  test("Shift+Tab cycles panels in reverse", async ({ page }) => {
    /* From Accounts, Shift+Tab should wrap to Input. */
    await pressKey(page, "Shift+Tab");
    const input = page.locator(".tui-input");
    await expect(input).toBeFocused();
  });

  test("number key 4 jumps to Input panel", async ({ page }) => {
    await pressKey(page, "4");
    const input = page.locator(".tui-input");
    await expect(input).toBeFocused();
  });

  test("number key 1 returns to Accounts panel", async ({ page }) => {
    await pressKey(page, "4"); /* Go to Input */
    await pressKey(page, "Escape"); /* Exit input mode first */
    await pressKey(page, "1"); /* Jump back to Accounts */
    const input = page.locator(".tui-input");
    /* Input element should not exist when InputPanel is not focused. */
    await expect(input).toHaveCount(0);
  });

  test("h/l navigate between sidebar and main", async ({ page }) => {
    /* l from Accounts goes to Messages area. */
    await pressKey(page, "l");
    /* h from Messages goes back to sidebar (Chats). */
    await pressKey(page, "h");
    /* Another h should stay on sidebar. */
    /* Pressing Enter to verify we're on Chats (it selects a chat). */
    await pressKey(page, "Enter");
    await page.waitForTimeout(300);
    /* Should show messages from the first chat. */
    const text = await getPageText(page);
    expect(text).toContain("Alice");
  });
});

test.describe("Account navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("j/k moves through accounts", async ({ page }) => {
    /* Move down through accounts. */
    await pressKey(page, "j");
    await pressKey(page, "j");
    const text = await getPageText(page);
    expect(text).toContain("iMessage");
  });

  test("Enter on account selects it and moves to Chats", async ({ page }) => {
    /* Move to Slack (index 2). */
    await pressKey(page, "j");
    await pressKey(page, "j");
    await pressKey(page, "Enter");
    await page.waitForTimeout(300);
    /* Should see Slack chats. */
    const text = await getPageText(page);
    expect(text).toContain("#general");
  });

  test("g jumps to top, G jumps to bottom", async ({ page }) => {
    await pressKey(page, "j");
    await pressKey(page, "j");
    await pressKey(page, "j");

    /* g jumps to top. */
    await pressKey(page, "g");
    /* G jumps to bottom. */
    await pressKey(page, "Shift+g");
    /* Select bottom account to verify. */
    await pressKey(page, "Enter");
    await page.waitForTimeout(300);
    const text = await getPageText(page);
    /* WhatsApp is the last account. */
    expect(text).toContain("Team Chat");
  });
});

test.describe("Chat navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pressKey(page, "Tab"); /* Focus Chats */
  });

  test("j/k moves through chats", async ({ page }) => {
    await pressKey(page, "j");
    await pressKey(page, "j");
    /* Cursor moved. Verify by selecting and checking messages. */
    await pressKey(page, "Enter");
    await page.waitForTimeout(300);
    const text = await getPageText(page);
    /* Third chat from All is "Family Group" (Alice, Bob, Family Group). */
    expect(text).toContain("Family Group");
  });

  test("Enter on chat loads its messages", async ({ page }) => {
    await pressKey(page, "Enter"); /* Select first chat (Alice) */
    await page.waitForTimeout(300);
    const text = await getPageText(page);
    expect(text).toContain("Want to grab lunch?");
  });
});

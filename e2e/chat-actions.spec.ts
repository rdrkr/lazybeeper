// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { test, expect } from "@playwright/test";
import { waitForAppReady, getPageText, pressKey } from "./helpers.js";

test.describe("Chat actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    /* Focus Chats panel. */
    await pressKey(page, "Tab");
  });

  test("m toggles mute on selected chat", async ({ page }) => {
    /* First chat is Alice, not muted. Press m to mute. */
    await pressKey(page, "m");
    await page.waitForTimeout(200);
    /* The muted indicator \u223c should now be on Alice's row.
     * We look for "Alice" followed by the mute symbol in the same context. */
    const text = await getPageText(page);
    /* Alice should now show the mute indicator. */
    const aliceIdx = text.indexOf("Alice");
    expect(aliceIdx).toBeGreaterThan(-1);
    /* Find ∼ after Alice but before the next chat name (Bob). */
    const bobIdx = text.indexOf("Bob", aliceIdx);
    const segment = text.substring(aliceIdx, bobIdx > aliceIdx ? bobIdx : aliceIdx + 50);
    expect(segment).toContain("\u223c");

    /* Press m again to unmute. */
    await pressKey(page, "m");
    await page.waitForTimeout(200);
    const text2 = await getPageText(page);
    const aliceIdx2 = text2.indexOf("Alice");
    const bobIdx2 = text2.indexOf("Bob", aliceIdx2);
    const segment2 = text2.substring(aliceIdx2, bobIdx2 > aliceIdx2 ? bobIdx2 : aliceIdx2 + 50);
    expect(segment2).not.toContain("\u223c");
  });

  test("p toggles pin on selected chat", async ({ page }) => {
    /* First chat is Alice, not pinned. Press p to pin. */
    await pressKey(page, "p");
    await page.waitForTimeout(200);
    const text = await getPageText(page);
    const aliceIdx = text.indexOf("Alice");
    expect(aliceIdx).toBeGreaterThan(-1);
    const bobIdx = text.indexOf("Bob", aliceIdx);
    const segment = text.substring(aliceIdx, bobIdx > aliceIdx ? bobIdx : aliceIdx + 50);
    expect(segment).toContain("\u2605");

    /* Press p again to unpin. */
    await pressKey(page, "p");
    await page.waitForTimeout(200);
    const text2 = await getPageText(page);
    const aliceIdx2 = text2.indexOf("Alice");
    const bobIdx2 = text2.indexOf("Bob", aliceIdx2);
    const segment2 = text2.substring(aliceIdx2, bobIdx2 > aliceIdx2 ? bobIdx2 : aliceIdx2 + 50);
    expect(segment2).not.toContain("\u2605");
  });

  test("a opens archive confirmation for selected chat", async ({ page }) => {
    await pressKey(page, "a");
    await page.waitForTimeout(200);
    const text = await getPageText(page);
    expect(text).toContain("Confirm");
    expect(text).toContain("Alice");
  });
});

test.describe("Chat selection modes", () => {
  test("navigate mode previews chat on cursor move", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    /* Switch to navigate mode. */
    await pressKey(page, "c");
    await pressKey(page, "j"); /* Selection Mode */
    await pressKey(page, "Enter"); /* Toggle to navigate */
    await pressKey(page, "Escape");
    await page.waitForTimeout(200);

    /* Navigate to Chats and move down. */
    await pressKey(page, "Tab");
    /* Move to Bob (second chat). */
    await pressKey(page, "j");
    await page.waitForTimeout(500);
    const text = await getPageText(page);
    /* In navigate mode, Bob's messages should preview without pressing Enter. */
    expect(text).toContain("See you tomorrow");
  });
});

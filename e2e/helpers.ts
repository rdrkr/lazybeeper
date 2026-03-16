// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { type Page, expect } from "@playwright/test";

/**
 * Waits for the app to finish loading and render the main layout.
 * @param page - The Playwright page.
 */
export async function waitForAppReady(page: Page): Promise<void> {
  /* The status bar shows "MOCK" when the app has loaded. */
  await expect(page.getByText("MOCK")).toBeVisible({ timeout: 10_000 });
}

/**
 * Returns all visible text content of the page body.
 * @param page - The Playwright page.
 * @returns The full text content string.
 */
export async function getPageText(page: Page): Promise<string> {
  return (await page.locator("#root").textContent()) ?? "";
}

/**
 * Presses a key and waits briefly for the React re-render.
 * @param page - The Playwright page.
 * @param key - The key to press (Playwright key syntax).
 */
export async function pressKey(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  /* Allow React to re-render. */
  await page.waitForTimeout(150);
}

/**
 * Clears localStorage and reloads the page to get a fresh app state.
 * @param page - The Playwright page.
 */
export async function resetApp(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await waitForAppReady(page);
}

/**
 * Checks whether text matching a pattern is visible on the page.
 * @param page - The Playwright page.
 * @param text - The text or regex to search for.
 * @returns True if visible.
 */
export async function hasVisibleText(page: Page, text: string | RegExp): Promise<boolean> {
  const loc = page.getByText(text);
  return (await loc.count()) > 0 && (await loc.first().isVisible());
}

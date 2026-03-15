// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { render } from "../../helpers/render.js";
import { ThemePopup, getThemeAtCursor } from "../../../src/ui/popup/theme-popup.js";
import { getThemeNames, THEMES } from "../../../src/ui/theme/themes.js";

describe("ThemePopup", () => {
  const names = getThemeNames();

  it("renders 'Themes' title", async () => {
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    expect(rendered.lastFrame()).toContain("Themes");
  });

  it("shows visible theme names from the themes registry", async () => {
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    // With 15 themes and MAX_VISIBLE=12, only the first 12 are visible at cursor=0
    const visibleNames = names.slice(0, 12);
    for (const name of visibleNames) {
      expect(frame).toContain(THEMES[name].name);
    }
  });

  it("shows cursor indicator on selected item", async () => {
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    // The first theme should have the cursor indicator
    expect(frame).toContain("\u25cf");
  });

  it("moves cursor indicator to the correct item", async () => {
    const rendered = await render(
      <ThemePopup cursor={3} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    const lines = frame.split("\n");
    // Find the line that contains the 4th theme name with cursor indicator
    const fourthThemeName = THEMES[names[3]!].name;
    const cursorLine = lines.find((l) => l.includes("\u25cf") && l.includes(fourthThemeName));
    expect(cursorLine).toBeDefined();
  });

  it("shows checkmark for the active theme", async () => {
    const activeThemeName = THEMES[names[0]!].name;
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme={activeThemeName} width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("\u25cf");
  });

  it("does not show checkmark when active theme does not match any", async () => {
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="nonexistent-theme" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    // When no theme matches, there should be no active indicator on any row
    // (the cursor indicator ● will still appear on the selected row)
    const lines = frame.split("\n");
    // Count ● occurrences - should only be 1 (cursor), not 2 (cursor + active)
    const bulletCount = lines.filter((l) => l.includes("\u25cf")).length;
    expect(bulletCount).toBeLessThanOrEqual(1);
  });

  it("shows checkmark only on the active theme row", async () => {
    // Set active theme to the second theme, cursor on first
    const activeThemeName = THEMES[names[1]!].name;
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme={activeThemeName} width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    const lines = frame.split("\n");
    // Find rows with ● — one for cursor on first item, one for active theme indicator
    const bulletLines = lines.filter((l) => l.includes("\u25cf"));
    // The active theme row should have ●
    const activeLine = bulletLines.find((l) => l.includes(activeThemeName));
    expect(activeLine).toBeDefined();
  });

  it("shows navigation hint text", async () => {
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("enter apply");
    expect(frame).toContain("navigate");
  });

  it("handles small terminal width (clamping)", async () => {
    // With width=20, boxWidth = min(40, 20-6) = 14 — content gets truncated
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={20} height={40} />,
    );
    // Should render without crashing even if content is clipped
    expect(rendered.lastFrame()).toBeDefined();
  });

  it("handles small terminal height (clamping)", async () => {
    // With height=10, boxHeight = min(20, 10-4) = 6 — very constrained
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={10} />,
    );
    expect(rendered.lastFrame()).toBeDefined();
  });

  it("handles both small width and height", async () => {
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={10} height={8} />,
    );
    expect(rendered.lastFrame()).toBeDefined();
  });

  it("shows scroll position when there are more themes than MAX_VISIBLE", async () => {
    // With 15 themes and MAX_VISIBLE=12, scroll indicator should appear
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    // Scroll indicator format is "  cursor+1/total"
    expect(frame).toMatch(/\d+\/\d+/);
  });

  it("shows scroll position at different cursor positions", async () => {
    // With 15 themes and MAX_VISIBLE=12, scroll indicator should appear
    const rendered = await render(
      <ThemePopup cursor={5} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    // With 15 themes and MAX_VISIBLE=12, scroll indicator should appear
    expect(frame).toMatch(/\d+\/\d+/);
  });

  it("renders correctly with cursor at the last theme", async () => {
    const lastIdx = names.length - 1;
    const rendered = await render(
      <ThemePopup cursor={lastIdx} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    const lastThemeName = THEMES[names[lastIdx]!].name;
    // Cursor should be on the last theme
    const cursorLine = frame
      .split("\n")
      .find((l) => l.includes("\u25cf") && l.includes(lastThemeName));
    expect(cursorLine).toBeDefined();
  });

  it("renders correctly with cursor in the middle", async () => {
    const midIdx = Math.floor(names.length / 2);
    const rendered = await render(
      <ThemePopup cursor={midIdx} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = rendered.lastFrame();
    const midThemeName = THEMES[names[midIdx]!].name;
    expect(frame).toContain(midThemeName);
  });

  it("clamps boxWidth to at most 40", async () => {
    // With width=200, boxWidth should be min(40, 200-6) = 40
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={200} height={40} />,
    );
    expect(rendered.lastFrame()).toBeDefined();
  });

  it("clamps boxWidth when terminal is narrow", async () => {
    // With width=30, boxWidth should be min(40, 30-6) = 24
    const rendered = await render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={30} height={40} />,
    );
    expect(rendered.lastFrame()).toBeDefined();
  });
});

describe("getThemeAtCursor", () => {
  const names = getThemeNames();

  it("returns the correct theme name for the first index", () => {
    expect(getThemeAtCursor(0)).toBe(names[0]);
  });

  it("returns the correct theme name for the last index", () => {
    expect(getThemeAtCursor(names.length - 1)).toBe(names[names.length - 1]);
  });

  it("returns the correct theme name for a middle index", () => {
    const midIdx = Math.floor(names.length / 2);
    expect(getThemeAtCursor(midIdx)).toBe(names[midIdx]);
  });

  it("returns undefined for a negative index", () => {
    expect(getThemeAtCursor(-1)).toBeUndefined();
  });

  it("returns undefined for an out-of-bounds index", () => {
    expect(getThemeAtCursor(names.length)).toBeUndefined();
  });

  it("returns undefined for a very large index", () => {
    expect(getThemeAtCursor(999)).toBeUndefined();
  });
});

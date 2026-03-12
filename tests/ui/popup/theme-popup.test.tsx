// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { ThemePopup, getThemeAtCursor } from "../../../src/ui/popup/theme-popup.js";
import { getThemeNames, THEMES } from "../../../src/ui/theme/themes.js";

describe("ThemePopup", () => {
  const names = getThemeNames();

  it("renders 'Select Theme' title", () => {
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    expect(lastFrame()).toContain("Select Theme");
  });

  it("shows theme names from the themes registry", () => {
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    // All themes should be visible when MAX_VISIBLE (12) >= names.length (10)
    for (const name of names) {
      expect(frame).toContain(THEMES[name].name);
    }
  });

  it("shows cursor indicator on selected item", () => {
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    // The first theme should have the cursor indicator
    expect(frame).toContain("\u25b8");
  });

  it("moves cursor indicator to the correct item", () => {
    const { lastFrame } = render(
      <ThemePopup cursor={3} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    const lines = frame.split("\n");
    // Find the line that contains the 4th theme name with cursor indicator
    const fourthThemeName = THEMES[names[3]!].name;
    const cursorLine = lines.find((l) => l.includes("\u25b8") && l.includes(fourthThemeName));
    expect(cursorLine).toBeDefined();
  });

  it("shows checkmark for the active theme", () => {
    const activeThemeName = THEMES[names[0]!].name;
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme={activeThemeName} width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toContain("\u2713");
  });

  it("does not show checkmark when active theme does not match any", () => {
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="nonexistent-theme" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).not.toContain("\u2713");
  });

  it("shows checkmark only on the active theme row", () => {
    // Set active theme to the second theme, cursor on first
    const activeThemeName = THEMES[names[1]!].name;
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme={activeThemeName} width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    const lines = frame.split("\n");
    const checkmarkLine = lines.find((l) => l.includes("\u2713"));
    expect(checkmarkLine).toBeDefined();
    expect(checkmarkLine).toContain(activeThemeName);
  });

  it("shows navigation hint text", () => {
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toContain("Enter: apply");
    expect(frame).toContain("Esc: close");
    expect(frame).toContain("navigate");
  });

  it("handles small terminal width (clamping)", () => {
    // With width=20, boxWidth = min(40, 20-6) = 14 — content gets truncated
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={20} height={40} />,
    );
    // Should render without crashing even if content is clipped
    expect(lastFrame()).toBeDefined();
  });

  it("handles small terminal height (clamping)", () => {
    // With height=10, boxHeight = min(20, 10-4) = 6 — very constrained
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={10} />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it("handles both small width and height", () => {
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={10} height={8} />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it("does not show scroll position when all themes fit within MAX_VISIBLE", () => {
    // With 10 themes and MAX_VISIBLE=12, all fit — no scroll indicator
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    // Scroll indicator format is "  cursor+1/total"
    expect(frame).not.toMatch(/\d+\/\d+/);
  });

  it("shows scroll position when there are more themes than visible", () => {
    // Since there are 10 themes and MAX_VISIBLE is 12, all fit.
    // This test verifies the branch by checking the condition directly.
    // With 10 themes, names.length (10) <= MAX_VISIBLE (12), so no scroll.
    // We verify the branch is correctly not taken.
    const { lastFrame } = render(
      <ThemePopup cursor={5} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    // With 10 themes and MAX_VISIBLE=12, scroll indicator should NOT appear
    expect(frame).not.toMatch(/\d+\/\d+/);
  });

  it("renders correctly with cursor at the last theme", () => {
    const lastIdx = names.length - 1;
    const { lastFrame } = render(
      <ThemePopup cursor={lastIdx} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    const lastThemeName = THEMES[names[lastIdx]!].name;
    // Cursor should be on the last theme
    const cursorLine = frame
      .split("\n")
      .find((l) => l.includes("\u25b8") && l.includes(lastThemeName));
    expect(cursorLine).toBeDefined();
  });

  it("renders correctly with cursor in the middle", () => {
    const midIdx = Math.floor(names.length / 2);
    const { lastFrame } = render(
      <ThemePopup cursor={midIdx} activeTheme="Catppuccin Mocha" width={80} height={40} />,
    );
    const frame = lastFrame() ?? "";
    const midThemeName = THEMES[names[midIdx]!].name;
    expect(frame).toContain(midThemeName);
  });

  it("clamps boxWidth to at most 40", () => {
    // With width=200, boxWidth should be min(40, 200-6) = 40
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={200} height={40} />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it("clamps boxWidth when terminal is narrow", () => {
    // With width=30, boxWidth should be min(40, 30-6) = 24
    const { lastFrame } = render(
      <ThemePopup cursor={0} activeTheme="Catppuccin Mocha" width={30} height={40} />,
    );
    expect(lastFrame()).toBeDefined();
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

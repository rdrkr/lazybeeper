// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ThemeName } from "../../../src/ui/theme/types.js";
import { THEMES } from "../../../src/ui/theme/themes.js";

/**
 * Generate a list of theme names longer than MAX_VISIBLE (12)
 * to exercise the scroll position indicator branch.
 */
const extendedNames: ThemeName[] = [
  "catppuccin-mocha",
  "catppuccin-macchiato",
  "catppuccin-frappe",
  "catppuccin-latte",
  "tokyo-night",
  "tokyo-night-storm",
  "dracula",
  "nord",
  "gruvbox-dark",
  "one-dark",
  /* Duplicates to exceed MAX_VISIBLE (12). */
  "catppuccin-mocha",
  "catppuccin-macchiato",
  "catppuccin-frappe",
];

vi.mock("../../../src/ui/theme/themes.js", async () => {
  const actual = await vi.importActual<typeof import("../../../src/ui/theme/themes.js")>(
    "../../../src/ui/theme/themes.js",
  );
  return {
    ...actual,
    getThemeNames: (): ThemeName[] => extendedNames,
  };
});

/* Dynamic import after mock is set up. */
let ThemePopup: typeof import("../../../src/ui/popup/theme-popup.js").ThemePopup;
let render: typeof import("ink-testing-library").render;

beforeEach(async () => {
  const mod = await import("../../../src/ui/popup/theme-popup.js");
  ThemePopup = mod.ThemePopup;
  const inkTest = await import("ink-testing-library");
  render = inkTest.render;
});

describe("ThemePopup scroll indicator", () => {
  it("shows scroll position when themes exceed MAX_VISIBLE", () => {
    const { lastFrame } = render(
      <ThemePopup
        cursor={5}
        activeTheme={THEMES["catppuccin-mocha"].name}
        width={80}
        height={40}
      />,
    );
    const frame = lastFrame() ?? "";
    /* Scroll indicator format: "  cursor+1/total" → "  6/13" */
    expect(frame).toMatch(/6\/13/);
  });

  it("shows correct scroll position at first item", () => {
    const { lastFrame } = render(
      <ThemePopup
        cursor={0}
        activeTheme={THEMES["catppuccin-mocha"].name}
        width={80}
        height={40}
      />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toMatch(/1\/13/);
  });

  it("shows correct scroll position at last item", () => {
    const { lastFrame } = render(
      <ThemePopup
        cursor={12}
        activeTheme={THEMES["catppuccin-mocha"].name}
        width={80}
        height={40}
      />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toMatch(/13\/13/);
  });
});

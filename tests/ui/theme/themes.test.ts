// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import {
  THEMES,
  DEFAULT_THEME,
  getThemeNames,
  resolveTheme,
} from "../../../src/ui/theme/themes.js";

describe("THEMES", () => {
  it("contains the expected number of built-in themes", () => {
    expect(Object.keys(THEMES).length).toBe(14);
  });

  it("has valid theme objects for every entry", () => {
    for (const theme of Object.values(THEMES)) {
      expect(theme.name).toBeTruthy();
      expect(theme.background).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.text).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.border).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.borderActive).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("includes catppuccin-mocha as default", () => {
    expect(THEMES["catppuccin-mocha"]).toBeDefined();
    expect(THEMES["catppuccin-mocha"].name).toBe("Catppuccin Mocha");
  });

  it("includes all catppuccin variants", () => {
    expect(THEMES["catppuccin-mocha"]).toBeDefined();
    expect(THEMES["catppuccin-macchiato"]).toBeDefined();
    expect(THEMES["catppuccin-frappe"]).toBeDefined();
    expect(THEMES["catppuccin-latte"]).toBeDefined();
  });

  it("includes tokyo-night variants", () => {
    expect(THEMES["tokyo-night"]).toBeDefined();
    expect(THEMES["tokyo-night-storm"]).toBeDefined();
  });

  it("includes dracula, nord, gruvbox-dark, one-dark", () => {
    expect(THEMES.dracula).toBeDefined();
    expect(THEMES.nord).toBeDefined();
    expect(THEMES["gruvbox-dark"]).toBeDefined();
    expect(THEMES["one-dark"]).toBeDefined();
  });

  it("includes everforest, kanagawa, flexoki, monokai", () => {
    expect(THEMES.everforest).toBeDefined();
    expect(THEMES.kanagawa).toBeDefined();
    expect(THEMES.flexoki).toBeDefined();
    expect(THEMES.monokai).toBeDefined();
  });
});

describe("DEFAULT_THEME", () => {
  it("is catppuccin-mocha", () => {
    expect(DEFAULT_THEME).toBe("catppuccin-mocha");
  });

  it("exists in THEMES", () => {
    expect(THEMES[DEFAULT_THEME]).toBeDefined();
  });
});

describe("getThemeNames", () => {
  it("returns all theme names", () => {
    const names = getThemeNames();
    expect(names).toContain("catppuccin-mocha");
    expect(names).toContain("dracula");
    expect(names).toContain("nord");
    expect(names).toContain("tokyo-night");
    expect(names.length).toBe(14);
  });
});

describe("resolveTheme", () => {
  it("resolves a valid theme name", () => {
    const theme = resolveTheme("dracula");
    expect(theme.name).toBe("Dracula");
  });

  it("falls back to default for unknown names", () => {
    const theme = resolveTheme("nonexistent");
    expect(theme.name).toBe("Catppuccin Mocha");
  });

  it("falls back to default for empty string", () => {
    const theme = resolveTheme("");
    expect(theme.name).toBe("Catppuccin Mocha");
  });
});

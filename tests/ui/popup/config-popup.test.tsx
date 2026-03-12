// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { ConfigPopup, CONFIG_ENTRY_COUNT } from "../../../src/ui/popup/config-popup.js";
import { SelectionMode } from "../../../src/domain/config-file.js";

describe("ConfigPopup", () => {
  it("renders configuration title", () => {
    const { lastFrame } = render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        width={80}
        height={40}
      />,
    );
    expect(lastFrame()).toContain("Configuration");
  });

  it("renders theme entry with current value", () => {
    const { lastFrame } = render(
      <ConfigPopup
        cursor={0}
        currentTheme="Dracula"
        selectionMode={SelectionMode.Enter}
        width={80}
        height={40}
      />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toContain("Theme");
    expect(frame).toContain("Dracula");
  });

  it("renders selection mode entry with current value", () => {
    const { lastFrame } = render(
      <ConfigPopup
        cursor={1}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Navigate}
        width={80}
        height={40}
      />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toContain("Selection Mode");
    expect(frame).toContain("navigate");
  });

  it("shows cursor indicator on selected item", () => {
    const { lastFrame } = render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        width={80}
        height={40}
      />,
    );
    expect(lastFrame()).toContain("\u25b8");
  });

  it("renders hint text", () => {
    const { lastFrame } = render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        width={80}
        height={40}
      />,
    );
    expect(lastFrame()).toContain("Enter: edit");
    expect(lastFrame()).toContain("Esc: close");
  });

  it("handles small terminal sizes without crashing", () => {
    const { lastFrame } = render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        width={20}
        height={10}
      />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it("exports CONFIG_ENTRY_COUNT as 2", () => {
    expect(CONFIG_ENTRY_COUNT).toBe(2);
  });
});

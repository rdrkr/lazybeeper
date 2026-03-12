// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { HelpPopup } from "../../../src/ui/popup/help-popup.js";

describe("HelpPopup", () => {
  it("renders keybinding reference title", () => {
    const { lastFrame } = render(<HelpPopup width={80} height={40} />);
    expect(lastFrame()).toContain("Keybinding Reference");
  });

  it("renders key descriptions", () => {
    const { lastFrame } = render(<HelpPopup width={100} height={50} />);
    const frame = lastFrame() ?? "";
    expect(frame).toContain("Quit");
    expect(frame).toContain("Cycle panels");
    expect(frame).toContain("Archive / unarchive");
  });

  it("renders key bindings", () => {
    const { lastFrame } = render(<HelpPopup width={80} height={40} />);
    const frame = lastFrame();
    expect(frame).toContain("q / Ctrl+C");
    expect(frame).toContain("Quit");
    expect(frame).toContain("Tab / Shift+Tab");
    expect(frame).toContain("j / k");
  });

  it("renders close hint", () => {
    const { lastFrame } = render(<HelpPopup width={80} height={40} />);
    expect(lastFrame()).toContain("Press Esc or ? to close");
  });

  it("handles small terminal sizes without crashing", () => {
    const { lastFrame } = render(<HelpPopup width={30} height={15} />);
    expect(lastFrame()).toBeDefined();
  });
});

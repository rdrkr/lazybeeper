// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { render } from "../../helpers/render.js";
import { HelpPopup } from "../../../src/ui/popup/help-popup.js";

describe("HelpPopup", () => {
  it("renders keybinding reference title", async () => {
    const rendered = await render(<HelpPopup width={80} height={40} />);
    expect(rendered.lastFrame()).toContain("Keybinding Reference");
  });

  it("renders key descriptions", async () => {
    const rendered = await render(<HelpPopup width={100} height={50} />);
    const frame = rendered.lastFrame();
    expect(frame).toContain("Quit");
    expect(frame).toContain("Cycle panels");
    expect(frame).toContain("Archive / unarchive");
  });

  it("renders key bindings", async () => {
    const rendered = await render(<HelpPopup width={80} height={40} />);
    const frame = rendered.lastFrame();
    expect(frame).toContain("q / Ctrl+C");
    expect(frame).toContain("Quit");
    expect(frame).toContain("Tab / Shift+Tab");
    expect(frame).toContain("j / k");
  });

  it("renders close hint", async () => {
    const rendered = await render(<HelpPopup width={80} height={40} />);
    expect(rendered.lastFrame()).toContain("Press Esc or ? to close");
  });

  it("handles small terminal sizes without crashing", async () => {
    const rendered = await render(<HelpPopup width={30} height={15} />);
    expect(rendered.lastFrame()).toBeDefined();
  });
});

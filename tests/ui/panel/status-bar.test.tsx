// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "../../helpers/render.js";
import { StatusBar } from "../../../src/ui/panel/status-bar.js";
import { PanelFocus } from "../../../src/ui/viewmodel/context.js";

/** Default props shared across tests. */
const defaults = {
  width: 80,
  focus: PanelFocus.Accounts,
  chatName: "",
  isMock: false,
  errorMessage: "",
  errorTime: 0,
  errorDuration: 0,
};

describe("StatusBar", () => {
  it("renders keybinding hints", async () => {
    const rendered = await render(<StatusBar {...defaults} />);
    const frame = rendered.lastFrame();
    expect(frame).toContain("Tab");
    expect(frame).toContain("j/k");
    expect(frame).toContain("search");
    expect(frame).toContain("config");
    expect(frame).toContain("help");
    expect(frame).toContain("quit");
  });

  it("renders LIVE mode", async () => {
    const rendered = await render(<StatusBar {...defaults} />);
    expect(rendered.lastFrame()).toContain("LIVE");
  });

  it("renders MOCK mode", async () => {
    const rendered = await render(<StatusBar {...defaults} isMock={true} />);
    expect(rendered.lastFrame()).toContain("MOCK");
  });

  it("renders chat name when set", async () => {
    const rendered = await render(
      <StatusBar {...defaults} focus={PanelFocus.Messages} chatName="Alice" />,
    );
    expect(rendered.lastFrame()).toContain("Alice");
  });

  it("renders panel focus name", async () => {
    const rendered = await render(<StatusBar {...defaults} focus={PanelFocus.Messages} />);
    expect(rendered.lastFrame()).toContain("Messages");
  });

  it("renders active error", async () => {
    const rendered = await render(
      <StatusBar {...defaults} errorMessage="Connection failed" errorTime={Date.now()} />,
    );
    expect(rendered.lastFrame()).toContain("Connection failed");
  });

  it("does not render expired error", async () => {
    const rendered = await render(
      <StatusBar {...defaults} errorMessage="Old error" errorTime={Date.now() - 15_000} />,
    );
    expect(rendered.lastFrame()).not.toContain("Old error");
  });

  describe("error expiry timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("clears error after expiry interval elapses", async () => {
      const errorTime = Date.now();
      const rendered = await render(
        <StatusBar {...defaults} errorMessage="Timed error" errorTime={errorTime} />,
      );
      expect(rendered.lastFrame()).toContain("Timed error");
      await vi.advanceTimersByTimeAsync(11_000);
      await rendered.update();
      expect(rendered.lastFrame()).not.toContain("Timed error");
      rendered.unmount();
    });

    it("respects custom errorDuration for expiry", async () => {
      const errorTime = Date.now();
      const rendered = await render(
        <StatusBar
          {...defaults}
          errorMessage="Short error"
          errorTime={errorTime}
          errorDuration={3_000}
        />,
      );
      expect(rendered.lastFrame()).toContain("Short error");
      await vi.advanceTimersByTimeAsync(4_000);
      await rendered.update();
      expect(rendered.lastFrame()).not.toContain("Short error");
      rendered.unmount();
    });
  });
});

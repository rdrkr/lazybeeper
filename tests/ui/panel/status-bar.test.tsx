// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "ink-testing-library";
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
};

describe("StatusBar", () => {
  it("renders keybinding hints", () => {
    const { lastFrame } = render(<StatusBar {...defaults} />);
    const frame = lastFrame();
    expect(frame).toContain("Tab");
    expect(frame).toContain("j/k");
    expect(frame).toContain("search");
    expect(frame).toContain("config");
    expect(frame).toContain("help");
    expect(frame).toContain("quit");
  });

  it("renders LIVE mode", () => {
    const { lastFrame } = render(<StatusBar {...defaults} />);
    expect(lastFrame()).toContain("LIVE");
  });

  it("renders MOCK mode", () => {
    const { lastFrame } = render(<StatusBar {...defaults} isMock={true} />);
    expect(lastFrame()).toContain("MOCK");
  });

  it("renders chat name when set", () => {
    const { lastFrame } = render(
      <StatusBar {...defaults} focus={PanelFocus.Messages} chatName="Alice" />,
    );
    expect(lastFrame()).toContain("Alice");
  });

  it("renders panel focus name", () => {
    const { lastFrame } = render(<StatusBar {...defaults} focus={PanelFocus.Messages} />);
    expect(lastFrame()).toContain("Messages");
  });

  it("renders active error", () => {
    const { lastFrame } = render(
      <StatusBar {...defaults} errorMessage="Connection failed" errorTime={Date.now()} />,
    );
    expect(lastFrame()).toContain("Connection failed");
  });

  it("does not render expired error", () => {
    const { lastFrame } = render(
      <StatusBar {...defaults} errorMessage="Old error" errorTime={Date.now() - 15_000} />,
    );
    expect(lastFrame()).not.toContain("Old error");
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
      const inst = render(
        <StatusBar {...defaults} errorMessage="Timed error" errorTime={errorTime} />,
      );
      expect(inst.lastFrame()).toContain("Timed error");
      await vi.advanceTimersByTimeAsync(11_000);
      expect(inst.lastFrame()).not.toContain("Timed error");
      inst.unmount();
    });
  });
});

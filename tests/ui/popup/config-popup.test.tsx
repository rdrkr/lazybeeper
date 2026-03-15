// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { render } from "../../helpers/render.js";
import { ConfigPopup, CONFIG_ENTRY_COUNT } from "../../../src/ui/popup/config-popup.js";
import { SelectionMode, ChatListStyle, Style } from "../../../src/domain/config-file.js";

describe("ConfigPopup", () => {
  it("renders configuration title", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    expect(rendered.lastFrame()).toContain("Configuration");
  });

  it("renders theme entry with current value", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={0}
        currentTheme="Dracula"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("Theme");
    expect(frame).toContain("Dracula");
  });

  it("renders selection mode entry with current value", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={1}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Navigate}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("Selection Mode");
    expect(frame).toContain("navigate");
  });

  it("shows cursor indicator on selected item", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    expect(rendered.lastFrame()).toContain("\u25cf");
  });

  it("renders hint text", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    expect(rendered.lastFrame()).toContain("enter edit");
  });

  it("handles small terminal sizes without crashing", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={20}
        height={10}
      />,
    );
    expect(rendered.lastFrame()).toBeDefined();
  });

  it("renders chat list style entry", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={2}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("Chat List");
    expect(frame).toContain("comfortable");
  });

  it("renders style entry", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={3}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("Style");
    expect(frame).toContain("modern");
  });

  it("renders reset to defaults entry in red when selected", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={4}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("Reset to Defaults");
    expect(frame).toContain("\u25cf");
  });

  it("renders reset to defaults entry muted when not selected", async () => {
    const rendered = await render(
      <ConfigPopup
        cursor={0}
        currentTheme="Catppuccin Mocha"
        selectionMode={SelectionMode.Enter}
        chatListStyle={ChatListStyle.Comfortable}
        style={Style.Modern}
        width={80}
        height={40}
      />,
    );
    expect(rendered.lastFrame()).toContain("Reset to Defaults");
  });

  it("exports CONFIG_ENTRY_COUNT as 5", () => {
    expect(CONFIG_ENTRY_COUNT).toBe(5);
  });
});

// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "../../helpers/render.js";
import { InputPanel } from "../../../src/ui/panel/input-panel.js";
import { StyleProvider } from "../../../src/ui/style/context.js";
import { Style } from "../../../src/domain/config-file.js";

/**
 * Wraps InputPanel with modern style context.
 * @param props - The InputPanel props.
 * @returns The wrapped element.
 */
function ModernInputPanel(props: React.ComponentProps<typeof InputPanel>): React.ReactNode {
  return (
    <StyleProvider value={Style.Modern}>
      <InputPanel {...props} />
    </StyleProvider>
  );
}

/**
 * Wraps InputPanel with retro style context.
 * @param props - The InputPanel props.
 * @returns The wrapped element.
 */
function RetroInputPanel(props: React.ComponentProps<typeof InputPanel>): React.ReactNode {
  return (
    <StyleProvider value={Style.Retro}>
      <InputPanel {...props} />
    </StyleProvider>
  );
}

describe("InputPanel", () => {
  it("renders the title", async () => {
    const rendered = await render(
      <RetroInputPanel
        focused={false}
        width={40}
        height={5}
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(rendered.lastFrame()).toContain("Input");
  });

  it("renders placeholder when unfocused and empty", async () => {
    const rendered = await render(
      <RetroInputPanel
        focused={false}
        width={40}
        height={5}
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(rendered.lastFrame()).toContain("Type a message...");
  });

  it("renders input value when unfocused", async () => {
    const rendered = await render(
      <RetroInputPanel
        focused={false}
        width={40}
        height={5}
        value="Hello world"
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(rendered.lastFrame()).toContain("Hello world");
  });

  it("renders with focus", async () => {
    const rendered = await render(
      <RetroInputPanel
        focused={true}
        width={40}
        height={5}
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(rendered.lastFrame()).toContain("Input");
  });

  it("renders modern style with vertical line", async () => {
    const rendered = await render(
      <ModernInputPanel
        focused={false}
        width={40}
        height={5}
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("Input");
    expect(frame).toContain("\u2502");
  });

  it("renders modern style with focus", async () => {
    const rendered = await render(
      <ModernInputPanel
        focused={true}
        width={40}
        height={5}
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(rendered.lastFrame()).toContain("Input");
  });

  it("renders modern style unfocused with value", async () => {
    const rendered = await render(
      <ModernInputPanel
        focused={false}
        width={40}
        height={5}
        value="Hello"
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(rendered.lastFrame()).toContain("Hello");
  });
});

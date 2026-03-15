// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { render } from "../../helpers/render.js";
import { InputPanel } from "../../../src/ui/panel/input-panel.js";

describe("InputPanel", () => {
  it("renders the title", async () => {
    const rendered = await render(
      <InputPanel
        focused={false}
        width={40}
        height={5}
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(rendered.lastFrame()).toContain("Input [4]");
  });

  it("renders placeholder when unfocused and empty", async () => {
    const rendered = await render(
      <InputPanel
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
      <InputPanel
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
      <InputPanel
        focused={true}
        width={40}
        height={5}
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(rendered.lastFrame()).toContain("Input [4]");
  });
});

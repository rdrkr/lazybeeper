// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { InputPanel } from "../../../src/ui/panel/input-panel.js";

describe("InputPanel", () => {
  it("renders the title", () => {
    const { lastFrame } = render(
      <InputPanel
        focused={false}
        width={40}
        height={5}
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(lastFrame()).toContain("Input [4]");
  });

  it("renders placeholder when unfocused and empty", () => {
    const { lastFrame } = render(
      <InputPanel
        focused={false}
        width={40}
        height={5}
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(lastFrame()).toContain("Type a message...");
  });

  it("renders input value when unfocused", () => {
    const { lastFrame } = render(
      <InputPanel
        focused={false}
        width={40}
        height={5}
        value="Hello world"
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(lastFrame()).toContain("Hello world");
  });

  it("renders with focus", () => {
    const { lastFrame } = render(
      <InputPanel
        focused={true}
        width={40}
        height={5}
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(lastFrame()).toContain("Input [4]");
  });
});

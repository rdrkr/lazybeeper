// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { ConfirmPopup } from "../../../src/ui/popup/confirm-popup.js";
import { ChatAction } from "../../../src/ui/viewmodel/messages.js";

describe("ConfirmPopup", () => {
  it("renders confirm title", () => {
    const { lastFrame } = render(
      <ConfirmPopup
        message='Archive chat "Alice"?'
        action={ChatAction.Archive}
        data="chat1"
        selected={1}
        onSelectionChange={() => {}}
        onResult={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("Confirm");
  });

  it("renders the message", () => {
    const { lastFrame } = render(
      <ConfirmPopup
        message='Archive chat "Alice"?'
        action={ChatAction.Archive}
        data="chat1"
        selected={1}
        onSelectionChange={() => {}}
        onResult={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("Archive chat");
  });

  it("renders yes and no buttons", () => {
    const { lastFrame } = render(
      <ConfirmPopup
        message="Test?"
        action={ChatAction.Archive}
        data="chat1"
        selected={0}
        onSelectionChange={() => {}}
        onResult={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("Yes");
    expect(lastFrame()).toContain("No");
  });

  it("renders hints text", () => {
    const { lastFrame } = render(
      <ConfirmPopup
        message="Test?"
        action={ChatAction.Archive}
        data="chat1"
        selected={1}
        onSelectionChange={() => {}}
        onResult={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("y/n");
  });
});

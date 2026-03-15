// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { render } from "../../helpers/render.js";
import { ConfirmPopup } from "../../../src/ui/popup/confirm-popup.js";
import { ChatAction } from "../../../src/ui/viewmodel/messages.js";

describe("ConfirmPopup", () => {
  it("renders confirm title", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("Confirm");
  });

  it("renders the message", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("Archive chat");
  });

  it("renders yes and no buttons", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("Yes");
    expect(rendered.lastFrame()).toContain("No");
  });

  it("renders hints text", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("y/n");
  });
});

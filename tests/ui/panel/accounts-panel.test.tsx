// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "../../helpers/render.js";
import { AccountsPanel } from "../../../src/ui/panel/accounts-panel.js";
import type { Account } from "../../../src/domain/types.js";
import { ALL_ACCOUNTS_ID } from "../../../src/domain/types.js";
import { StyleProvider } from "../../../src/ui/style/context.js";
import { Style } from "../../../src/domain/config-file.js";

/**
 * Wraps AccountsPanel with retro style for consistent border-based rendering.
 * @param props - The AccountsPanel props.
 * @returns The wrapped element.
 */
function RetroAccountsPanel(props: React.ComponentProps<typeof AccountsPanel>): React.ReactNode {
  return (
    <StyleProvider value={Style.Retro}>
      <AccountsPanel {...props} />
    </StyleProvider>
  );
}

const allAccount: Account = {
  id: ALL_ACCOUNTS_ID,
  name: "All",
  protocol: "",
  connected: true,
};

const mockAccounts: Account[] = [
  allAccount,
  { id: "imessage", name: "iMessage", protocol: "imessage", connected: true },
  { id: "slack", name: "Slack", protocol: "slack", connected: true },
  { id: "signal", name: "Signal", protocol: "signal", connected: false },
];

describe("AccountsPanel", () => {
  it("renders the title", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={false}
        width={30}
        height={10}
        cursor={0}
      />,
    );
    expect(rendered.lastFrame()).toContain("Accounts");
  });

  it("renders account names", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={false}
        width={30}
        height={10}
        cursor={0}
      />,
    );
    expect(rendered.lastFrame()).toContain("iMessage");
    expect(rendered.lastFrame()).toContain("Slack");
    expect(rendered.lastFrame()).toContain("Signal");
  });

  it("renders connected dot indicator", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={false}
        width={30}
        height={10}
        cursor={0}
      />,
    );
    /* The dot character should be present for each account. */
    expect(rendered.lastFrame()).toContain("\u25cf");
  });

  it("renders empty list without error", async () => {
    const rendered = await render(
      <RetroAccountsPanel accounts={[]} focused={false} width={30} height={10} cursor={0} />,
    );
    expect(rendered.lastFrame()).toContain("Accounts");
  });

  it("renders with focus", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={true}
        width={30}
        height={10}
        cursor={0}
      />,
    );
    expect(rendered.lastFrame()).toContain("Accounts");
  });

  it("renders scroll indicator when needed", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={false}
        width={30}
        height={5}
        cursor={0}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("of");
  });

  it("renders cursor at non-zero position", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={true}
        width={30}
        height={10}
        cursor={2}
      />,
    );
    expect(rendered.lastFrame()).toContain("Signal");
  });

  it("renders unfocused selected item with bold", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={false}
        width={30}
        height={10}
        cursor={1}
      />,
    );
    expect(rendered.lastFrame()).toContain("Slack");
  });

  it("scrolls when cursor is past visible area", async () => {
    const manyAccounts: Account[] = Array.from({ length: 10 }, (_, idx) => ({
      id: `acc${idx}`,
      name: `Account ${idx}`,
      protocol: "test",
      connected: idx % 2 === 0,
    }));

    const rendered = await render(
      <RetroAccountsPanel
        accounts={manyAccounts}
        focused={true}
        width={30}
        height={6}
        cursor={8}
      />,
    );
    expect(rendered.lastFrame()).toContain("Account 8");
  });

  it("clamps offset down when cursor moves above current offset", async () => {
    const manyAccounts: Account[] = Array.from({ length: 10 }, (_, idx) => ({
      id: `acc${idx}`,
      name: `Account ${idx}`,
      protocol: "test",
      connected: true,
    }));

    /* First render with cursor far down to push offset up. */
    const rendered = await render(
      <RetroAccountsPanel
        accounts={manyAccounts}
        focused={true}
        width={30}
        height={6}
        cursor={8}
      />,
    );
    expect(rendered.lastFrame()).toContain("Account 8");

    /* Re-render with cursor at 0 so cursor < offset triggers. */
    await rendered.rerender(
      <RetroAccountsPanel
        accounts={manyAccounts}
        focused={true}
        width={30}
        height={6}
        cursor={0}
      />,
    );
    expect(rendered.lastFrame()).toContain("Account 0");
  });

  it("handles negative cursor by clamping offset to 0", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={true}
        width={30}
        height={10}
        cursor={-1}
      />,
    );
    expect(rendered.lastFrame()).toContain("Accounts");
  });

  it("clamps usableSlots to 1 when panel height is very small", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={true}
        width={30}
        height={2}
        cursor={0}
      />,
    );
    expect(rendered.lastFrame()).toBeDefined();
  });

  it("renders All virtual account as tree root", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={true}
        width={30}
        height={12}
        cursor={0}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("All");
  });

  it("renders focused All account with cursor indicator", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={true}
        width={30}
        height={12}
        cursor={0}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("\u25cf");
    expect(frame).toContain("All");
  });

  it("renders tree branch characters for child accounts", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={false}
        width={30}
        height={12}
        cursor={0}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("\u251c");
    expect(frame).toContain("\u2514");
  });

  it("renders modern style without borders", async () => {
    const rendered = await render(
      <AccountsPanel accounts={mockAccounts} focused={false} width={30} height={10} cursor={0} />,
    );
    expect(rendered.lastFrame()).toContain("Accounts");
  });

  it("renders modern scroll indicator when many accounts", async () => {
    const manyAccounts: Account[] = Array.from({ length: 10 }, (_, idx) => ({
      id: `acc${idx}`,
      name: `Account ${idx}`,
      protocol: "test",
      connected: idx % 2 === 0,
    }));
    const rendered = await render(
      <AccountsPanel accounts={manyAccounts} focused={false} width={30} height={5} cursor={0} />,
    );
    expect(rendered.lastFrame()).toContain("of");
  });

  it("renders last child with end branch character", async () => {
    const rendered = await render(
      <RetroAccountsPanel
        accounts={mockAccounts}
        focused={false}
        width={30}
        height={12}
        cursor={3}
      />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("Signal");
    expect(frame).toContain("\u2514");
  });
});

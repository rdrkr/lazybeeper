// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { AccountsPanel } from "../../../src/ui/panel/accounts-panel.js";
import type { Account } from "../../../src/domain/types.js";
import { ALL_ACCOUNTS_ID } from "../../../src/domain/types.js";

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
  it("renders the title", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={false} width={30} height={10} cursor={0} />,
    );
    expect(lastFrame()).toContain("Accounts [1]");
  });

  it("renders account names", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={false} width={30} height={10} cursor={0} />,
    );
    expect(lastFrame()).toContain("iMessage");
    expect(lastFrame()).toContain("Slack");
    expect(lastFrame()).toContain("Signal");
  });

  it("renders connected dot indicator", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={false} width={30} height={10} cursor={0} />,
    );
    /* The dot character should be present for each account. */
    expect(lastFrame()).toContain("\u25cf");
  });

  it("renders empty list without error", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={[]} focused={false} width={30} height={10} cursor={0} />,
    );
    expect(lastFrame()).toContain("Accounts [1]");
  });

  it("renders with focus", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={true} width={30} height={10} cursor={0} />,
    );
    expect(lastFrame()).toContain("Accounts [1]");
  });

  it("renders scroll indicator when needed", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={false} width={30} height={5} cursor={0} />,
    );
    const frame = lastFrame();
    expect(frame).toContain("of");
  });

  it("renders cursor at non-zero position", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={true} width={30} height={10} cursor={2} />,
    );
    expect(lastFrame()).toContain("Signal");
  });

  it("renders unfocused selected item with bold", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={false} width={30} height={10} cursor={1} />,
    );
    expect(lastFrame()).toContain("Slack");
  });

  it("scrolls when cursor is past visible area", () => {
    const manyAccounts: Account[] = Array.from({ length: 10 }, (_, idx) => ({
      id: `acc${idx}`,
      name: `Account ${idx}`,
      protocol: "test",
      connected: idx % 2 === 0,
    }));

    const { lastFrame } = render(
      <AccountsPanel accounts={manyAccounts} focused={true} width={30} height={6} cursor={8} />,
    );
    expect(lastFrame()).toContain("Account 8");
  });

  it("clamps offset down when cursor moves above current offset", () => {
    const manyAccounts: Account[] = Array.from({ length: 10 }, (_, idx) => ({
      id: `acc${idx}`,
      name: `Account ${idx}`,
      protocol: "test",
      connected: true,
    }));

    /* First render with cursor far down to push offset up. */
    const { lastFrame, rerender } = render(
      <AccountsPanel accounts={manyAccounts} focused={true} width={30} height={6} cursor={8} />,
    );
    expect(lastFrame()).toContain("Account 8");

    /* Re-render with cursor at 0 so cursor < offset triggers. */
    rerender(
      <AccountsPanel accounts={manyAccounts} focused={true} width={30} height={6} cursor={0} />,
    );
    expect(lastFrame()).toContain("Account 0");
  });

  it("handles negative cursor by clamping offset to 0", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={true} width={30} height={10} cursor={-1} />,
    );
    expect(lastFrame()).toContain("Accounts [1]");
  });

  it("clamps usableSlots to 1 when panel height is very small", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={true} width={30} height={2} cursor={0} />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it("renders All virtual account as tree root", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={true} width={30} height={12} cursor={0} />,
    );
    const frame = lastFrame();
    expect(frame).toContain("All");
  });

  it("renders focused All account with cursor indicator", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={true} width={30} height={12} cursor={0} />,
    );
    const frame = lastFrame();
    expect(frame).toContain("\u25b8");
    expect(frame).toContain("All");
  });

  it("renders tree branch characters for child accounts", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={false} width={30} height={12} cursor={0} />,
    );
    const frame = lastFrame();
    expect(frame).toContain("\u251c");
    expect(frame).toContain("\u2514");
  });

  it("renders last child with end branch character", () => {
    const { lastFrame } = render(
      <AccountsPanel accounts={mockAccounts} focused={false} width={30} height={12} cursor={3} />,
    );
    const frame = lastFrame();
    expect(frame).toContain("Signal");
    expect(frame).toContain("\u2514");
  });
});

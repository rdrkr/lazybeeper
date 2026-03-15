// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React, { useState } from "react";
import { TextAttributes } from "@opentui/core";
import type { Account } from "../../domain/types.js";
import { ALL_ACCOUNTS_ID } from "../../domain/types.js";
import { useTheme } from "../theme/context.js";
import { useStyle } from "../style/context.js";
import { Style } from "../../domain/config-file.js";

/** Props for the AccountsPanel component. */
interface AccountsPanelProps {
  /** List of accounts to display. */
  readonly accounts: Account[];
  /** Whether this panel has keyboard focus. */
  readonly focused: boolean;
  /** Panel width in characters. */
  readonly width: number;
  /** Panel height in characters. */
  readonly height: number;
  /** Current cursor position (controlled externally). */
  readonly cursor: number;
}

/**
 * AccountsPanel displays the list of messaging accounts with connection status.
 * Memoized to prevent unnecessary re-renders when sibling state changes.
 */
export const AccountsPanel = React.memo(function AccountsPanel({
  accounts,
  focused,
  width,
  height,
  cursor,
}: AccountsPanelProps): React.ReactNode {
  const theme = useTheme();
  const style = useStyle();
  const isModern = style === Style.Modern;
  const [offset, setOffset] = useState(0);

  const innerHeight = Math.max(height - (isModern ? 0 : 2), 0);
  const titleLines = 1;
  let usableSlots = innerHeight - titleLines;

  if (accounts.length > usableSlots) {
    usableSlots--;
  }

  if (usableSlots < 1) {
    usableSlots = 1;
  }

  const clampedOffset = clampOffset(cursor, offset, usableSlots);
  if (clampedOffset !== offset) {
    setOffset(clampedOffset);
  }

  const end = Math.min(clampedOffset + usableSlots, accounts.length);
  const visible = accounts.slice(clampedOffset, end);

  const borderColor = focused ? theme.borderActive : theme.border;

  return (
    <box
      flexDirection="column"
      width={width}
      height={height}
      border={!isModern}
      borderStyle={isModern ? undefined : "rounded"}
      borderColor={isModern ? undefined : borderColor}
      backgroundColor={isModern ? theme.backgroundPanel : undefined}
    >
      <text attributes={TextAttributes.BOLD} fg={theme.primary}>
        {" Accounts [1]"}
      </text>
      {visible.map((acct, visIdx) => {
        const idx = clampedOffset + visIdx;
        return (
          <AccountLine
            key={acct.id}
            account={acct}
            index={idx}
            cursor={cursor}
            focused={focused}
            isLast={idx === accounts.length - 1}
          />
        );
      })}
      {accounts.length > usableSlots && (
        <text fg={theme.textMuted}>
          {"   "}[{clampedOffset + 1}-{end} of {accounts.length}]
        </text>
      )}
    </box>
  );
});

/** Props for a single account line. */
interface AccountLineProps {
  /** The account to render. */
  readonly account: Account;
  /** Index in the full list. */
  readonly index: number;
  /** Current cursor position. */
  readonly cursor: number;
  /** Whether the panel has focus. */
  readonly focused: boolean;
  /** Whether this is the last item in the list. */
  readonly isLast: boolean;
}

/**
 * Renders a single account entry line with tree structure.
 * The "All" virtual account renders as the tree root.
 * Real accounts render as indented tree children with branch characters.
 * @param root0 - The component props.
 * @param root0.account - The account to render.
 * @param root0.index - Index in the full list.
 * @param root0.cursor - Current cursor position.
 * @param root0.focused - Whether the panel has focus.
 * @param root0.isLast - Whether this is the last item in the list.
 * @returns The rendered account line element.
 */
function AccountLine({
  account,
  index,
  cursor,
  focused,
  isLast,
}: AccountLineProps): React.ReactNode {
  const theme = useTheme();
  const isSelected = index === cursor;
  const isAllAccount = account.id === ALL_ACCOUNTS_ID;

  let nameColor: string = theme.text;
  let bold = false;

  if (isSelected && focused) {
    nameColor = theme.selectedText;
    bold = true;
  } else if (isSelected) {
    nameColor = theme.text;
    bold = true;
  } else {
    nameColor = theme.textMuted;
  }

  if (isAllAccount) {
    const indicator = isSelected && focused ? "\u25cf " : "  ";
    return (
      <text>
        <span fg={theme.primary}> {indicator}</span>
        <span fg={nameColor} attributes={bold ? TextAttributes.BOLD : undefined}>
          {account.name}
        </span>
      </text>
    );
  }

  const branch = isLast ? "\u2514" : "\u251c";
  const indicator = isSelected && focused ? "\u25cf" : " ";
  const dotColor = account.connected ? theme.connected : theme.disconnected;

  return (
    <text>
      <span fg={theme.borderSubtle}>
        {" "}
        {branch}
        {indicator}
      </span>
      <span fg={dotColor}>{"\u25cf"}</span>
      <span> </span>
      <span fg={nameColor} attributes={bold ? TextAttributes.BOLD : undefined}>
        {account.name}
      </span>
    </text>
  );
}

/**
 * Ensures cursor is visible within the scroll window.
 * @param cursor - The current cursor position.
 * @param offset - The current scroll offset.
 * @param slots - The number of visible slots.
 * @returns The adjusted scroll offset.
 */
function clampOffset(cursor: number, offset: number, slots: number): number {
  let result = offset;

  if (cursor < result) {
    result = cursor;
  }

  if (cursor >= result + slots) {
    result = cursor - slots + 1;
  }

  if (result < 0) {
    result = 0;
  }

  return result;
}

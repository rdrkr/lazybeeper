// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { TextAttributes } from "@opentui/core";
import type { Chat } from "../../domain/types.js";
import { useTheme } from "../theme/context.js";

/** Maximum number of search results to display. */
const MAX_RESULTS = 10;

/** Props for the SearchPopup component. */
interface SearchPopupProps {
  /** All chats available for searching. */
  readonly chats: Chat[];
  /** Current search query. */
  readonly query: string;
  /** Callback when query changes. */
  readonly onQueryChange: (query: string) => void;
  /** Filtered results. */
  readonly filtered: Chat[];
  /** Current cursor in results. */
  readonly cursor: number;
  /** Callback when a result is selected. */
  readonly onSelect: (chat: Chat) => void;
  /** Callback to close the popup. */
  readonly onClose: () => void;
  /** Total terminal width. */
  readonly width: number;
  /** Total terminal height. */
  readonly height: number;
}

/**
 * SearchPopup provides a chat search overlay with live filtering.
 * @param root0 - The component props.
 * @param root0.query - Current search query string.
 * @param root0.onQueryChange - Callback when the query changes.
 * @param root0.filtered - Filtered chat results.
 * @param root0.cursor - Current cursor index in results.
 * @param root0.width - Total terminal width.
 * @param root0.height - Total terminal height.
 * @returns The rendered search popup element.
 */
export function SearchPopup({
  query,
  onQueryChange,
  filtered,
  cursor,
  width,
  height,
}: SearchPopupProps): React.ReactNode {
  const theme = useTheme();
  const boxWidth = Math.min(50, width - 6);
  const boxHeight = Math.min(18, height - 4);

  return (
    <box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width={width}
      height={height}
    >
      <box
        flexDirection="column"
        border={true}
        borderStyle="rounded"
        borderColor={theme.borderActive}
        backgroundColor={theme.background}
        paddingX={2}
        paddingY={1}
        width={boxWidth}
        height={boxHeight}
      >
        <box flexDirection="row" justifyContent="space-between" width={boxWidth - 6}>
          <text attributes={TextAttributes.BOLD} fg={theme.primary}>
            Search
          </text>
          <text fg={theme.textMuted}>esc</text>
        </box>
        <text>{""}</text>
        <input value={query} onChange={onQueryChange} placeholder="Search chats..." />
        <text>{""}</text>
        {filtered.length === 0 ? (
          <text fg={theme.textMuted}>{"  No results"}</text>
        ) : (
          filtered.slice(0, MAX_RESULTS).map((chat, idx) => {
            const isSelected = idx === cursor;
            const indicator = isSelected ? "\u25cf " : "  ";
            const color = isSelected ? theme.selectedText : theme.textMuted;

            return (
              <text
                key={chat.id}
                fg={color}
                attributes={isSelected ? TextAttributes.BOLD : undefined}
              >
                {indicator}
                {chat.name}
                {chat.unreadCount > 0 ? ` (${chat.unreadCount})` : ""}
              </text>
            );
          })
        )}
        {filtered.length > MAX_RESULTS && (
          <text fg={theme.textMuted}>
            {"  ... and "}
            {filtered.length - MAX_RESULTS}
            {" more"}
          </text>
        )}
        <text>{""}</text>
        <text fg={theme.textMuted}>{"enter select  \u2191/\u2193 navigate"}</text>
      </box>
    </box>
  );
}

/**
 * Filters chats based on a search query. Matches on name or last message.
 * @param chats - The full list of chats to filter.
 * @param query - The search query string.
 * @returns The filtered list of matching chats.
 */
export function filterChats(chats: Chat[], query: string): Chat[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return chats;
  }

  return chats.filter((chat) => {
    const nameMatch = chat.name.toLowerCase().includes(trimmed);
    const msgMatch = chat.lastMessage.toLowerCase().includes(trimmed);
    return nameMatch || msgMatch;
  });
}

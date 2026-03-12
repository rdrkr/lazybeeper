// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "ink";
import type { Chat } from "../../domain/types.js";
import { useTheme } from "../theme/context.js";
import { truncate, relativeTime, chatAvatar } from "../../domain/textutil.js";
import {
  isKittySupported,
  loadKittyImage,
  writeImageOverlays,
  deleteAllImages,
  getTmuxRowOffset,
} from "../kitty.js";

/** Number of rendered lines each chat entry takes. */
const LINES_PER_CHAT = 2;

/** Column offset where the avatar is rendered (border + prefix). */
const AVATAR_COL = 5;

/** Props for the ChatsPanel component. */
interface ChatsPanelProps {
  /** List of chats to display. */
  readonly chats: Chat[];
  /** Whether this panel has keyboard focus. */
  readonly focused: boolean;
  /** Panel width in characters. */
  readonly width: number;
  /** Panel height in characters. */
  readonly height: number;
  /** Current cursor position. */
  readonly cursor: number;
  /** Vertical offset of this panel from the top of the terminal. */
  readonly top: number;
}

/**
 * ChatsPanel displays the list of chats for the selected account.
 * Each chat shows on two lines: name + indicators, then preview + time.
 * Memoized to prevent unnecessary re-renders when sibling state changes.
 */
export const ChatsPanel = React.memo(function ChatsPanel({
  chats,
  focused,
  width,
  height,
  cursor,
  top,
}: ChatsPanelProps): React.ReactElement {
  const theme = useTheme();
  const [offset, setOffset] = useState(0);

  const innerWidth = Math.max(width - 2, 0);
  const innerHeight = Math.max(height - 2, 0);
  const titleLines = 1;
  let usable = innerHeight - titleLines;

  if (chats.length * LINES_PER_CHAT > usable) {
    usable--;
  }

  const slots = usable < LINES_PER_CHAT ? 1 : Math.floor(usable / LINES_PER_CHAT);

  const clampedOffset = clampOffset(cursor, offset, slots);
  if (clampedOffset !== offset) {
    setOffset(clampedOffset);
  }

  const end = Math.min(clampedOffset + slots, chats.length);
  const visible = chats.slice(clampedOffset, end);
  const borderColor = focused ? theme.borderActive : theme.border;

  /** Tracks the previous image fingerprint to avoid unnecessary redraws. */
  const prevImageKeyRef = useRef("");

  /*
   * Write Kitty graphics images directly to stdout after each render,
   * bypassing Ink's text pipeline which corrupts APC escape sequences.
   * Uses a fingerprint to skip redundant delete+redraw cycles (e.g.,
   * when only the cursor moved within the visible window).
   */
  useEffect(() => {
    /* v8 ignore start -- Kitty image overlay requires real terminal, covered by writeImageOverlays tests */
    if (!isKittySupported()) {
      return;
    }

    /* Build image descriptors with row positions (adjusted for tmux offset). */
    const tmuxOffset = getTmuxRowOffset();
    const images: { seq: string; row: number; col: number }[] = [];

    visible.forEach((chat, visIdx) => {
      if (!chat.avatarPath) {
        return;
      }

      const seq = loadKittyImage(chat.avatarPath, 2, 1);
      if (!seq) {
        return;
      }

      /* Row: top (panel Y offset) + 1 (border) + 1 (title) + visIdx * 2 + 1 (1-indexed). */
      const row = top + 3 + visIdx * LINES_PER_CHAT + tmuxOffset;
      images.push({ seq, row, col: AVATAR_COL });
    });

    /* Build fingerprint from avatars, positions, and tmux offset. */
    const imageKey = visible
      .map((c, i) => `${c.avatarPath ?? ""}:${String(top + 3 + i * LINES_PER_CHAT + tmuxOffset)}`)
      .join("|");

    /* Skip if nothing changed (prevents flicker on cursor navigation). */
    if (imageKey === prevImageKeyRef.current) {
      return;
    }
    prevImageKeyRef.current = imageKey;

    /* Defer drawing to ensure Ink's render cycle has completed. */
    const timer = setTimeout(() => {
      deleteAllImages();
      writeImageOverlays(images);
    }, 0);

    return (): void => {
      clearTimeout(timer);
    };
    /* v8 ignore stop */
  }, [visible, top, clampedOffset]);

  /* v8 ignore start -- cleanup only reachable with real Kitty terminal */
  /* Clean up Kitty images when the component unmounts. */
  useEffect(() => {
    return (): void => {
      if (isKittySupported()) {
        deleteAllImages();
      }
    };
  }, []);
  /* v8 ignore stop */

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="round"
      borderColor={borderColor}
    >
      <Text bold color={theme.primary}>
        {" Chats [2]"}
      </Text>
      {visible.length === 0 && <Text color={theme.textMuted}>{"   No chats"}</Text>}
      {visible.map((chat, visIdx) => {
        const idx = clampedOffset + visIdx;
        return (
          <ChatEntry
            key={chat.id}
            chat={chat}
            index={idx}
            cursor={cursor}
            focused={focused}
            innerWidth={innerWidth}
          />
        );
      })}
      {chats.length > slots && (
        <Text color={theme.textMuted}>
          {"   "}[{clampedOffset + 1}-{end} of {chats.length}]
        </Text>
      )}
    </Box>
  );
});

/** Props for a single chat entry. */
interface ChatEntryProps {
  /** The chat to render. */
  readonly chat: Chat;
  /** Index in the full list. */
  readonly index: number;
  /** Current cursor position. */
  readonly cursor: number;
  /** Whether the panel has focus. */
  readonly focused: boolean;
  /** Available inner width. */
  readonly innerWidth: number;
}

/**
 * Renders a single chat entry as two lines (name + preview).
 * @param root0 - The component props.
 * @param root0.chat - The chat to render.
 * @param root0.index - Index in the full list.
 * @param root0.cursor - Current cursor position.
 * @param root0.focused - Whether the panel has focus.
 * @param root0.innerWidth - Available inner width for rendering.
 * @returns The rendered chat entry element.
 */
function ChatEntry({
  chat,
  index,
  cursor,
  focused,
  innerWidth,
}: ChatEntryProps): React.ReactElement {
  const theme = useTheme();
  const isSelected = index === cursor;
  const prefix = isSelected && focused ? " \u25b8 " : "   ";

  const maxPreview = Math.max(innerWidth - 4, 10);
  const preview = truncate(chat.lastMessage, maxPreview);
  const timeStr = relativeTime(chat.lastMessageTime);
  const avatar = chatAvatar(chat.name);

  let nameColor: string = theme.text;
  let nameBold = false;

  if (isSelected && focused) {
    nameColor = theme.selectedText;
    nameBold = true;
  } else if (isSelected || chat.unreadCount > 0) {
    nameBold = true;
  }

  return (
    <Box flexDirection="column">
      <Text>
        <Text color={isSelected && focused ? theme.primary : theme.textMuted}>{prefix}</Text>
        <Text backgroundColor={avatar.color} color="#1e1e2e" bold>
          {avatar.initials}
        </Text>
        <Text> </Text>
        <Text color={nameColor} bold={nameBold}>
          {chat.name}
        </Text>
        {chat.pinned && <Text color={theme.pinnedIndicator}>{" \u2605"}</Text>}
        {chat.muted && <Text color={theme.mutedIndicator}>{" \u223c"}</Text>}
        {chat.unreadCount > 0 && (
          <Text bold color={theme.unreadBadge}>
            {" "}
            ({chat.unreadCount})
          </Text>
        )}
      </Text>
      <Text color={theme.textMuted}>
        {"   "}
        {preview} {"\u00b7"} <Text color={theme.timestamp}>{timeStr}</Text>
      </Text>
    </Box>
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

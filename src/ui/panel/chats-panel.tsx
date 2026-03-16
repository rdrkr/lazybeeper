// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React, { useState, useEffect, useRef, useMemo } from "react";
import { TextAttributes } from "@opentui/core";
import type { Chat } from "../../domain/types.js";
import { ChatListStyle, Style } from "../../domain/config-file.js";
import { useTheme } from "../theme/context.js";
import { useStyle } from "../style/context.js";
import { truncate, relativeTime, chatAvatar } from "../../domain/textutil.js";
import {
  isKittySupported,
  loadKittyImage,
  writeImageOverlays,
  deleteAllImages,
  getTmuxRowOffset,
  setVisibilityCallback,
  isInTmux,
} from "../kitty.js";

/** Number of rendered lines each compact chat entry takes. */
const LINES_PER_CHAT_COMPACT = 2;

/** Number of rendered lines each comfortable chat entry takes (3 content + 1 spacer). */
const LINES_PER_CHAT_COMFORTABLE = 4;

/** Avatar width in columns for compact mode (2 cols on 1 row). */
const AVATAR_COLS_COMPACT = 2;

/** Avatar width in columns for comfortable mode (5 cols ≈ square on 2 rows). */
const AVATAR_COLS_COMFORTABLE = 7;

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
  /** Chat list layout density. */
  readonly chatListStyle: ChatListStyle;
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
  chatListStyle,
}: ChatsPanelProps): React.ReactNode {
  const theme = useTheme();
  const style = useStyle();
  const isModern = style === Style.Modern;
  const [offset, setOffset] = useState(0);

  const isComfortable = chatListStyle === ChatListStyle.Comfortable;
  const linesPerChat = isComfortable ? LINES_PER_CHAT_COMFORTABLE : LINES_PER_CHAT_COMPACT;

  const innerWidth = Math.max(width - 2, 0);
  const innerHeight = Math.max(height - 2, 0);
  const titleLines = 1;
  let usable = innerHeight - titleLines;

  if (chats.length * linesPerChat > usable) {
    usable--;
  }

  const slots = usable < linesPerChat ? 1 : Math.floor(usable / linesPerChat);

  const clampedOffset = clampOffset(cursor, offset, slots);
  if (clampedOffset !== offset) {
    setOffset(clampedOffset);
  }

  const end = Math.min(clampedOffset + slots, chats.length);
  const visible = useMemo(() => chats.slice(clampedOffset, end), [chats, clampedOffset, end]);

  const borderColor = focused ? theme.borderActive : theme.border;

  /** Tracks the previous image fingerprint to avoid redundant redraws. */
  const prevImageKeyRef = useRef("");

  /** Tracks tmux pane visibility for image cleanup on window switch. */
  const [paneVis, setPaneVis] = useState(true);

  /* v8 ignore start -- tmux visibility callback requires real tmux session */
  useEffect(() => {
    if (!isKittySupported() || !isInTmux()) {
      return;
    }
    setVisibilityCallback((vis: boolean) => {
      setPaneVis(vis);
      if (!vis) {
        prevImageKeyRef.current = "";
      }
    });
    return (): void => {
      setVisibilityCallback(null);
    };
  }, []);
  /* v8 ignore stop */

  /*
   * Write Kitty graphics images directly to stdout after each render,
   * bypassing the text pipeline which corrupts APC escape sequences.
   * Uses a fingerprint to skip redundant delete+redraw cycles when the
   * visible chats and positions haven't changed (e.g. cursor-only moves
   * within the same scroll window).
   *
   * Images are written synchronously in the effect callback, which fires
   * after React commit and after OpenTUI's renderNative(), placing them
   * between render frames. Using setTimeout here would be racy: React
   * effect cleanup cancels pending timeouts when dependencies change
   * (e.g. from chats_loaded or messages_loaded dispatches), and the
   * fingerprint optimisation then prevents retrying.
   */
  /* v8 ignore start -- Kitty image overlay requires real terminal, covered by writeImageOverlays tests */
  useEffect(() => {
    if (!isKittySupported() || !paneVis) {
      return;
    }

    /* Build image descriptors with row positions (adjusted for tmux offset). */
    const tmuxOffset = getTmuxRowOffset();
    const images: { seq: string; row: number; col: number }[] = [];

    visible.forEach((chat, visIdx) => {
      if (!chat.avatarPath) {
        return;
      }

      const imgCols = isComfortable ? AVATAR_COLS_COMFORTABLE : AVATAR_COLS_COMPACT;
      const imgRows = linesPerChat - 1;
      const seq = loadKittyImage(chat.avatarPath, imgCols, imgRows);
      if (!seq) {
        return;
      }

      /** Row offset: border(1) + title(1) + spacer(1) + 1-indexed(1) = 4; modern shifts up 2. */
      const rowBase = isModern ? 3 : 4;
      const row = top + rowBase + visIdx * linesPerChat + tmuxOffset;
      images.push({ seq, row, col: AVATAR_COL });
    });

    /* Build fingerprint from avatars, positions, dimensions, and tmux offset. */
    const imageKey =
      `${String(width)}x${String(height)}|` +
      visible
        .map(
          (c, i) =>
            `${c.avatarPath ?? ""}:${String(top + (isModern ? 3 : 4) + i * linesPerChat + tmuxOffset)}`,
        )
        .join("|");

    /* Skip if nothing changed (prevents flicker on cursor navigation). */
    if (imageKey === prevImageKeyRef.current) {
      return;
    }
    prevImageKeyRef.current = imageKey;

    deleteAllImages();
    writeImageOverlays(images);
    /* v8 ignore stop */
  }, [visible, top, clampedOffset, paneVis, linesPerChat, isComfortable, isModern, width, height]);

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
    <box
      flexDirection="column"
      width={width}
      height={height}
      border={true}
      borderStyle="single"
      borderColor={isModern ? (focused ? theme.borderActive : theme.backgroundPanel) : borderColor}
      backgroundColor={isModern ? theme.backgroundPanel : undefined}
    >
      <text attributes={TextAttributes.BOLD} fg={theme.primary}>
        {" Chats [2]"}
      </text>
      <text> </text>
      {visible.length === 0 && <text fg={theme.textMuted}>{"   No chats"}</text>}
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
            chatListStyle={chatListStyle}
          />
        );
      })}
      {chats.length > slots && (
        <text fg={theme.textMuted}>
          {"   "}[{clampedOffset + 1}-{end} of {chats.length}]
        </text>
      )}
    </box>
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
  /** Chat list layout density. */
  readonly chatListStyle: ChatListStyle;
}

/**
 * Renders a single chat entry as two lines (name + preview).
 * @param root0 - The component props.
 * @param root0.chat - The chat to render.
 * @param root0.index - Index in the full list.
 * @param root0.cursor - Current cursor position.
 * @param root0.focused - Whether the panel has focus.
 * @param root0.innerWidth - Available inner width for rendering.
 * @param root0.chatListStyle - Chat list layout density.
 * @returns The rendered chat entry element.
 */
function ChatEntry({
  chat,
  index,
  cursor,
  focused,
  innerWidth,
  chatListStyle,
}: ChatEntryProps): React.ReactNode {
  const theme = useTheme();
  const isSelected = index === cursor;
  const prefix = isSelected && focused ? " \u25cf " : "   ";
  const isComfortable = chatListStyle === ChatListStyle.Comfortable;

  const timeStr = relativeTime(chat.lastMessageTime);
  const avatar = chatAvatar(chat.name);

  /* Avatar badge width: 2 cols for compact (square on 1 row), 7 cols for comfortable (square on 3 rows). */
  const avatarWidth = isComfortable ? AVATAR_COLS_COMFORTABLE : AVATAR_COLS_COMPACT;

  /** When avatar width is odd, prefix initials with "-" so 3-char string centers evenly. */
  const displayInitials = avatarWidth % 2 !== 0 ? `-${avatar.initials}` : avatar.initials;

  /** Characters consumed by prefix (3) + avatar + space (1). */
  const fixedCols = 3 + avatarWidth + 1;

  /* Build indicators suffix to measure its width. */
  let indicators = "";
  if (chat.pinned) indicators += " \u2605";
  if (chat.muted) indicators += " \u223c";
  if (chat.unreadCount > 0) indicators += ` (${chat.unreadCount})`;

  const maxName = Math.max(innerWidth - fixedCols - indicators.length, 4);
  const displayName = truncate(chat.name, maxName);

  let nameColor: string = theme.text;
  let nameBold = false;

  if (isSelected && focused) {
    nameColor = theme.selectedText;
    nameBold = true;
  } else if (isSelected || chat.unreadCount > 0) {
    nameBold = true;
  }

  /** Spacer matching prefix width (3 chars). */
  const linePrefix = "   ";
  /** Spacer matching avatar + gap width. */
  const avatarSpacer = " ".repeat(avatarWidth + 1);

  if (isComfortable) {
    /** Comfortable: 3 content lines + spacer. Avatar block is 7-wide x 3-tall. */
    const maxPreview = Math.max(innerWidth - fixedCols, 4);
    const preview = truncate(chat.lastMessage, maxPreview);
    /** Pad initials to fill the avatar width (e.g. "-AL" for 7-wide becomes "  -AL  "). */
    const initialsStr = displayInitials
      .padStart(Math.floor((avatarWidth + displayInitials.length) / 2))
      .padEnd(avatarWidth);

    return (
      <box flexDirection="column">
        <text>
          <span fg={isSelected && focused ? theme.primary : theme.textMuted}>{prefix}</span>
          <span bg={avatar.color}>{" ".repeat(avatarWidth)}</span>
          <span> </span>
          <span fg={nameColor} attributes={nameBold ? TextAttributes.BOLD : undefined}>
            {displayName}
          </span>
          {chat.pinned && <span fg={theme.pinnedIndicator}>{" \u2605"}</span>}
          {chat.muted && <span fg={theme.mutedIndicator}>{" \u223c"}</span>}
          {chat.unreadCount > 0 && (
            <span attributes={TextAttributes.BOLD} fg={theme.unreadBadge}>
              {" "}
              ({chat.unreadCount})
            </span>
          )}
        </text>
        <text>
          <span>{linePrefix}</span>
          <span bg={avatar.color} fg="#1e1e2e" attributes={TextAttributes.BOLD}>
            {initialsStr}
          </span>
          <span fg={theme.textMuted}> {preview}</span>
        </text>
        <text>
          <span>{linePrefix}</span>
          <span bg={avatar.color}>{" ".repeat(avatarWidth)}</span>
          <span fg={theme.textMuted}> {timeStr}</span>
        </text>
        <text> </text>
      </box>
    );
  }

  /** Compact: 2 lines — name line has avatar (2 cols), preview line has no avatar. */
  const timeSuffix = ` \u00b7 ${timeStr}`;
  /** Preview line: prefix + avatar spacer + preview + time. */
  const previewFixedCols = 3 + avatarWidth + 1;
  const maxPreview = Math.max(innerWidth - previewFixedCols - timeSuffix.length, 4);
  const preview = truncate(chat.lastMessage, maxPreview);

  return (
    <box flexDirection="column">
      <text>
        <span fg={isSelected && focused ? theme.primary : theme.textMuted}>{prefix}</span>
        <span bg={avatar.color} fg="#1e1e2e" attributes={TextAttributes.BOLD}>
          {displayInitials}
        </span>
        <span> </span>
        <span fg={nameColor} attributes={nameBold ? TextAttributes.BOLD : undefined}>
          {displayName}
        </span>
        {chat.pinned && <span fg={theme.pinnedIndicator}>{" \u2605"}</span>}
        {chat.muted && <span fg={theme.mutedIndicator}>{" \u223c"}</span>}
        {chat.unreadCount > 0 && (
          <span attributes={TextAttributes.BOLD} fg={theme.unreadBadge}>
            {" "}
            ({chat.unreadCount})
          </span>
        )}
      </text>
      <text>
        <span>{linePrefix}</span>
        <span>{avatarSpacer}</span>
        <span fg={theme.textMuted}>
          {preview}
          {timeSuffix}
        </span>
      </text>
    </box>
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

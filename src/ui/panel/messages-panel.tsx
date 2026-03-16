// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { TextAttributes } from "@opentui/core";
import type { Message } from "../../domain/types.js";
import type { Theme } from "../theme/types.js";
import { useTheme } from "../theme/context.js";
import { useStyle } from "../style/context.js";
import { Style } from "../../domain/config-file.js";
import { formatTime, dateLabel, sameDay, wrapText, buildScrollbar } from "../../domain/textutil.js";

/**
 * A rendered message line with optional styling metadata.
 * Plain lines carry only `text`; modern bubble lines include `accentBg`
 * and `accentBar` for the accent-colored background and vertical bar.
 * The `padLeft` field separates alignment padding from bubble content
 * so backgrounds only cover the bubble, not the whitespace.
 */
interface MessageLine {
  /** The text content of the line (bubble content only, no alignment padding). */
  readonly text: string;
  /** Number of leading spaces for right-alignment (rendered without background). */
  readonly padLeft?: number;
  /** Background color for bubble body (modern style). */
  readonly accentBg?: string;
  /** Vertical bar character + color for left/right edge (modern style). */
  readonly accentBar?: string;
  /** Whether the bar is on the right side (own messages). */
  readonly barRight?: boolean;
}

/** Props for the MessagesPanel component. */
interface MessagesPanelProps {
  /** List of messages to display. */
  readonly messages: Message[];
  /** Name of the active chat. */
  readonly chatName: string;
  /** Whether this panel has keyboard focus. */
  readonly focused: boolean;
  /** Panel width in characters. */
  readonly width: number;
  /** Panel height in characters. */
  readonly height: number;
  /** Current scroll offset. */
  readonly scrollOffset: number;
}

/**
 * MessagesPanel displays messages in a scrollable viewport with chat bubbles.
 * Memoized to prevent unnecessary re-renders when sibling state changes.
 */
export const MessagesPanel = React.memo(function MessagesPanel({
  messages,
  chatName,
  focused,
  width,
  height,
  scrollOffset,
}: MessagesPanelProps): React.ReactNode {
  const theme = useTheme();
  const style = useStyle();
  const isModern = style === Style.Modern;
  const innerWidth = Math.max(width - 2, 0);
  const innerHeight = Math.max(height - 2, 0);
  const vpHeight = Math.max(innerHeight - 1, 1);

  const titleText = chatName ? ` ${chatName} [3]` : " Messages [3]";
  const borderColor = focused ? theme.borderActive : theme.border;

  /** Scrollbar column width (1 when scrollbar visible, 0 otherwise). */
  const scrollbarWidth = 1;

  /** Content width: inner width minus scrollbar column. */
  const contentWidth = Math.max(innerWidth - scrollbarWidth, 1);

  const renderedLines = renderMessageLines(messages, contentWidth, isModern, theme);
  const totalLines = renderedLines.length;
  const maxOffset = Math.max(totalLines - vpHeight, 0);
  const clampedOffset = Math.min(Math.max(scrollOffset, 0), maxOffset);

  const visibleLines = renderedLines.slice(clampedOffset, clampedOffset + vpHeight);

  /** Scrollbar characters (empty when content fits). */
  const scrollbar = buildScrollbar(totalLines, vpHeight, clampedOffset);

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
        {titleText}
      </text>
      <box flexDirection="row" height={vpHeight}>
        <box flexDirection="column" width={contentWidth}>
          {visibleLines.length === 0 && (
            <text fg={theme.textMuted}>{"  No messages. Select a chat to view messages."}</text>
          )}
          {visibleLines.map((line, idx) => (
            <text key={`${clampedOffset + idx}`}>
              {line.padLeft && line.padLeft > 0 && <span>{" ".repeat(line.padLeft)}</span>}
              {line.accentBg && line.accentBar && !line.barRight && (
                <span fg={line.accentBar}>{"\u2502"}</span>
              )}
              {line.accentBg ? (
                <span bg={line.accentBg}>{line.text}</span>
              ) : (
                <span>{line.text}</span>
              )}
              {line.accentBg && line.accentBar && line.barRight && (
                <span fg={line.accentBar}>{"\u2502"}</span>
              )}
            </text>
          ))}
        </box>
        <box flexDirection="column" width={scrollbarWidth}>
          {scrollbar.length > 0 &&
            scrollbar.map((ch, i) => (
              <text key={`sb-${String(i)}`} fg={theme.textMuted}>
                {ch}
              </text>
            ))}
        </box>
      </box>
    </box>
  );
});

/**
 * Renders all messages as styled lines ready for display.
 * @param messages - The list of messages to render.
 * @param viewWidth - The available viewport width in characters.
 * @param modern - Whether to use modern style with accent backgrounds.
 * @param theme - The active color theme.
 * @returns An array of styled message lines.
 */
function renderMessageLines(
  messages: Message[],
  viewWidth: number,
  modern: boolean,
  theme: Theme,
): MessageLine[] {
  if (messages.length === 0) {
    return [];
  }

  const maxBubbleWidth = Math.max(Math.floor((viewWidth * 60) / 100), 20);
  const lines: MessageLine[] = [];

  for (let idx = 0; idx < messages.length; idx++) {
    const msg = messages[idx];
    if (!msg) {
      continue;
    }

    const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
    if (idx === 0 || (prevMsg && !sameDay(prevMsg.timestamp, msg.timestamp))) {
      const label = dateLabel(msg.timestamp);
      lines.push({ text: renderDateSeparator(label, viewWidth) });
    }

    /* Empty line before each message for visual separation. */
    if (idx > 0) {
      lines.push({ text: "" });
    }

    const bubbleLines = renderBubble(msg, viewWidth, maxBubbleWidth, modern, theme);
    lines.push(...bubbleLines);
  }

  return lines;
}

/**
 * Renders a centered date separator line.
 * @param label - The date label text to display.
 * @param viewWidth - The available viewport width in characters.
 * @returns The formatted date separator string.
 */
function renderDateSeparator(label: string, viewWidth: number): string {
  const dashCount = Math.max(Math.floor((viewWidth - label.length - 4) / 2), 1);
  const dashes = "\u2500".repeat(dashCount);
  return `${dashes} ${label} ${dashes}`;
}

/**
 * Renders a single message as styled bubble lines.
 * @param msg - The message to render.
 * @param viewWidth - The available viewport width in characters.
 * @param maxBubbleWidth - The maximum width of the message bubble.
 * @param modern - Whether to use modern style with accent backgrounds.
 * @param theme - The active color theme.
 * @returns An array of styled bubble lines.
 */
function renderBubble(
  msg: Message,
  viewWidth: number,
  maxBubbleWidth: number,
  modern: boolean,
  theme: Theme,
): MessageLine[] {
  const timeStr = formatTime(msg.timestamp);
  const bodyWidth = Math.max(maxBubbleWidth - 2, 10);
  const wrappedBody = wrapText(msg.body, bodyWidth);

  if (msg.isFromMe) {
    return renderOwnBubble(wrappedBody, timeStr, viewWidth, maxBubbleWidth, modern, theme);
  }

  return renderOtherBubble(msg.sender, wrappedBody, timeStr, maxBubbleWidth, modern, theme);
}

/**
 * Renders a right-aligned bubble for own messages.
 * In modern mode, body lines have an accent background and right vertical bar.
 * @param body - The wrapped message body text.
 * @param timeStr - The formatted timestamp string.
 * @param viewWidth - The available viewport width in characters.
 * @param maxBubbleWidth - The maximum bubble width for padding.
 * @param modern - Whether to use modern style with accent backgrounds.
 * @param theme - The active color theme.
 * @returns An array of styled right-aligned bubble lines.
 */
function renderOwnBubble(
  body: string,
  timeStr: string,
  viewWidth: number,
  maxBubbleWidth: number,
  modern: boolean,
  theme: Theme,
): MessageLine[] {
  const header = `You  ${timeStr}`;
  const bodyLines = body.split("\n");

  /** Bar width consumed by the vertical accent bar in modern mode. */
  const barWidth = modern ? 1 : 0;
  /** Longest body line length, plus 2 for inner padding. */
  const contentWidth = Math.max(...bodyLines.map((l) => l.length)) + 2;
  /** Bubble width: fits the content but never exceeds the maximum. */
  const bubbleWidth = Math.min(Math.max(contentWidth, 6), maxBubbleWidth);
  const headerPad = Math.max(viewWidth - header.length, 0);

  const lines: MessageLine[] = [{ text: header, padLeft: headerPad }];

  /**
   * Creates a right-aligned bubble line padded to the bubble width.
   * @param content - The text content for this bubble line.
   * @returns A styled message line.
   */
  const makeBubbleLine = (content: string): MessageLine => {
    const padded = content.padEnd(bubbleWidth);
    const pad = Math.max(viewWidth - padded.length - barWidth, 0);
    if (modern) {
      return {
        text: padded,
        padLeft: pad,
        accentBg: theme.backgroundElement,
        accentBar: theme.accent,
        barRight: true,
      };
    }
    return { text: padded, padLeft: pad };
  };

  /* Padding line before body. */
  lines.push(makeBubbleLine(""));

  for (const line of bodyLines) {
    lines.push(makeBubbleLine(" " + line));
  }

  /* Padding line after body. */
  lines.push(makeBubbleLine(""));

  return lines;
}

/**
 * Renders a left-aligned bubble for other messages.
 * In modern mode, body lines have an accent background and left vertical bar.
 * @param sender - The message sender name.
 * @param body - The wrapped message body text.
 * @param timeStr - The formatted timestamp string.
 * @param maxBubbleWidth - The maximum bubble width for padding.
 * @param modern - Whether to use modern style with accent backgrounds.
 * @param theme - The active color theme.
 * @returns An array of styled left-aligned bubble lines.
 */
function renderOtherBubble(
  sender: string,
  body: string,
  timeStr: string,
  maxBubbleWidth: number,
  modern: boolean,
  theme: Theme,
): MessageLine[] {
  const header = `${sender}  ${timeStr}`;
  const bodyLines = body.split("\n");

  /** Longest body line length, plus 2 for inner padding. */
  const contentWidth = Math.max(...bodyLines.map((l) => l.length)) + 2;
  /** Bubble width: fits the content but never exceeds the maximum. */
  const bubbleWidth = Math.min(Math.max(contentWidth, 6), maxBubbleWidth);

  const lines: MessageLine[] = [{ text: header }];

  /**
   * Creates a left-aligned bubble line padded to the bubble width.
   * @param content - The text content for this bubble line.
   * @returns A styled message line.
   */
  const makeBubbleLine = (content: string): MessageLine => {
    const padded = content.padEnd(bubbleWidth);
    if (modern) {
      return {
        text: padded,
        accentBg: theme.backgroundElement,
        accentBar: theme.primary,
        barRight: false,
      };
    }
    return { text: padded };
  };

  /* Padding line before body. */
  lines.push(makeBubbleLine(""));

  for (const line of bodyLines) {
    lines.push(makeBubbleLine(" " + line));
  }

  /* Padding line after body. */
  lines.push(makeBubbleLine(""));

  return lines;
}

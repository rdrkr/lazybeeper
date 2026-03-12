// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { Box, Text } from "ink";
import type { Message } from "../../domain/types.js";
import { useTheme } from "../theme/context.js";
import { formatTime, dateLabel, sameDay, wrapText } from "../../domain/textutil.js";

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
}: MessagesPanelProps): React.ReactElement {
  const theme = useTheme();
  const innerWidth = Math.max(width - 2, 0);
  const innerHeight = Math.max(height - 2, 0);
  const vpHeight = Math.max(innerHeight - 1, 1);

  const titleText = chatName ? `${chatName} - [3]` : "Messages [3]";
  const borderColor = focused ? theme.borderActive : theme.border;

  const renderedLines = renderMessageLines(messages, innerWidth);
  const totalLines = renderedLines.length;
  const maxOffset = Math.max(totalLines - vpHeight, 0);
  const clampedOffset = Math.min(Math.max(scrollOffset, 0), maxOffset);

  const visibleLines = renderedLines.slice(clampedOffset, clampedOffset + vpHeight);

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="round"
      borderColor={borderColor}
    >
      <Text bold color={theme.primary}>
        {" "}
        {titleText}
      </Text>
      <Box flexDirection="column" height={vpHeight}>
        {visibleLines.length === 0 && (
          <Text color={theme.textMuted}>{"  No messages. Select a chat to view messages."}</Text>
        )}
        {visibleLines.map((line, idx) => (
          <Text key={`${clampedOffset + idx}`}>{line}</Text>
        ))}
      </Box>
    </Box>
  );
});

/**
 * Renders all messages as plain text lines with inline formatting.
 * Returns an array of formatted strings ready for display.
 * @param messages - The list of messages to render.
 * @param viewWidth - The available viewport width in characters.
 * @returns An array of formatted text lines.
 */
function renderMessageLines(messages: Message[], viewWidth: number): string[] {
  if (messages.length === 0) {
    return [];
  }

  const maxBubbleWidth = Math.max(Math.floor((viewWidth * 60) / 100), 20);
  const lines: string[] = [];

  for (let idx = 0; idx < messages.length; idx++) {
    const msg = messages[idx];
    if (!msg) {
      continue;
    }

    const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
    if (idx === 0 || (prevMsg && !sameDay(prevMsg.timestamp, msg.timestamp))) {
      const label = dateLabel(msg.timestamp);
      lines.push(renderDateSeparator(label, viewWidth));
    }

    const bubbleLines = renderBubble(msg, viewWidth, maxBubbleWidth);
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
 * Renders a single message as bubble lines.
 * @param msg - The message to render.
 * @param viewWidth - The available viewport width in characters.
 * @param maxBubbleWidth - The maximum width of the message bubble.
 * @returns An array of formatted bubble lines.
 */
function renderBubble(msg: Message, viewWidth: number, maxBubbleWidth: number): string[] {
  const timeStr = formatTime(msg.timestamp);
  const bodyWidth = Math.max(maxBubbleWidth - 2, 10);
  const wrappedBody = wrapText(msg.body, bodyWidth);

  if (msg.isFromMe) {
    return renderOwnBubble(wrappedBody, timeStr, viewWidth, maxBubbleWidth);
  }

  return renderOtherBubble(msg.sender, wrappedBody, timeStr);
}

/**
 * Renders a right-aligned green bubble for own messages.
 * @param body - The wrapped message body text.
 * @param timeStr - The formatted timestamp string.
 * @param viewWidth - The available viewport width in characters.
 * @param _maxBubbleWidth - The maximum bubble width (unused).
 * @returns An array of right-aligned bubble lines.
 */
function renderOwnBubble(
  body: string,
  timeStr: string,
  viewWidth: number,
  _maxBubbleWidth: number,
): string[] {
  const header = `You  ${timeStr}`;
  const headerPad = Math.max(viewWidth - header.length, 0);

  const bodyLines = body.split("\n");
  const lines: string[] = [" ".repeat(headerPad) + header];

  for (const line of bodyLines) {
    const padLeft = Math.max(viewWidth - line.length - 2, 0);
    lines.push(" ".repeat(padLeft) + " " + line + " ");
  }

  return lines;
}

/**
 * Renders a left-aligned blue bubble for other messages.
 * @param sender - The message sender name.
 * @param body - The wrapped message body text.
 * @param timeStr - The formatted timestamp string.
 * @returns An array of left-aligned bubble lines.
 */
function renderOtherBubble(sender: string, body: string, timeStr: string): string[] {
  const header = `${sender}  ${timeStr}`;
  const bodyLines = body.split("\n");
  const lines: string[] = [header];

  for (const line of bodyLines) {
    lines.push(" " + line + " ");
  }

  return lines;
}

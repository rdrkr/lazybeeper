// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { TextAttributes } from "@opentui/core";
import { useTheme } from "../theme/context.js";
import { SelectionMode, ChatListStyle, Style } from "../../domain/config-file.js";

/** A single configuration menu entry. */
interface ConfigEntry {
  /** Display label for the entry. */
  readonly label: string;
  /** Unique key identifier. */
  readonly key: string;
  /** Current value to display. */
  readonly value: string;
  /** Whether this is a destructive action (shown in red). */
  readonly danger?: boolean;
}

/** Props for the ConfigPopup component. */
interface ConfigPopupProps {
  /** Currently selected cursor index. */
  readonly cursor: number;
  /** Current theme display name. */
  readonly currentTheme: string;
  /** Current selection mode. */
  readonly selectionMode: SelectionMode;
  /** Current chat list style. */
  readonly chatListStyle: ChatListStyle;
  /** Current visual style. */
  readonly style: Style;
  /** Total terminal width. */
  readonly width: number;
  /** Total terminal height. */
  readonly height: number;
}

/**
 * Builds the list of configuration entries.
 * @param currentTheme - The current theme display name.
 * @param selectionMode - The current selection mode.
 * @param chatListStyle - The current chat list style.
 * @param style - The current visual style.
 * @returns The list of config entries.
 */
function buildEntries(
  currentTheme: string,
  selectionMode: SelectionMode,
  chatListStyle: ChatListStyle,
  style: Style,
): ConfigEntry[] {
  return [
    { label: "Theme", key: "theme", value: currentTheme },
    { label: "Selection Mode", key: "selectionMode", value: selectionMode },
    { label: "Chat List", key: "chatListStyle", value: chatListStyle },
    { label: "Style", key: "style", value: style },
    { label: "Reset to Defaults", key: "reset", value: "", danger: true },
  ];
}

/**
 * ConfigPopup shows a configuration menu for application settings.
 * @param root0 - The component props.
 * @param root0.cursor - Currently selected cursor index.
 * @param root0.currentTheme - Current theme display name.
 * @param root0.selectionMode - Current selection mode.
 * @param root0.chatListStyle - Current chat list style.
 * @param root0.style - Current visual style.
 * @param root0.width - Total terminal width.
 * @param root0.height - Total terminal height.
 * @returns The rendered config popup element.
 */
export function ConfigPopup({
  cursor,
  currentTheme,
  selectionMode,
  chatListStyle,
  style,
  width,
  height,
}: ConfigPopupProps): React.ReactNode {
  const theme = useTheme();
  const boxWidth = Math.min(45, width - 6);
  const entries = buildEntries(currentTheme, selectionMode, chatListStyle, style);

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
      >
        <box flexDirection="row" justifyContent="space-between" width={boxWidth - 6}>
          <text attributes={TextAttributes.BOLD} fg={theme.primary}>
            Configuration
          </text>
          <text fg={theme.textMuted}>esc</text>
        </box>
        <text>{""}</text>
        {entries.map((entry, idx) => {
          const isSelected = idx === cursor;
          const indicator = isSelected ? "\u25cf " : "  ";

          if (entry.danger) {
            const labelColor = isSelected ? theme.textError : theme.textMuted;
            return (
              <text key={entry.key}>
                <span fg={isSelected ? theme.textError : theme.textMuted}>{indicator}</span>
                <span fg={labelColor} attributes={isSelected ? TextAttributes.BOLD : undefined}>
                  {entry.label}
                </span>
              </text>
            );
          }

          const labelColor = isSelected ? theme.selectedText : theme.text;

          return (
            <text key={entry.key}>
              <span fg={isSelected ? theme.primary : theme.textMuted}>{indicator}</span>
              <span fg={labelColor} attributes={isSelected ? TextAttributes.BOLD : undefined}>
                {entry.label}
              </span>
              <span fg={theme.textMuted}>{" \u2014 "}</span>
              <span fg={theme.accent}>{entry.value}</span>
            </text>
          );
        })}
        <text>{""}</text>
        <text fg={theme.textMuted}>{"enter edit  \u2191/\u2193 navigate"}</text>
      </box>
    </box>
  );
}

/** Total number of config entries. */
export const CONFIG_ENTRY_COUNT = 5;

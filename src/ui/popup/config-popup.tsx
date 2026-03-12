// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../theme/context.js";
import { SelectionMode } from "../../domain/config-file.js";

/** A single configuration menu entry. */
interface ConfigEntry {
  /** Display label for the entry. */
  readonly label: string;
  /** Unique key identifier. */
  readonly key: string;
  /** Current value to display. */
  readonly value: string;
}

/** Props for the ConfigPopup component. */
interface ConfigPopupProps {
  /** Currently selected cursor index. */
  readonly cursor: number;
  /** Current theme display name. */
  readonly currentTheme: string;
  /** Current selection mode. */
  readonly selectionMode: SelectionMode;
  /** Total terminal width. */
  readonly width: number;
  /** Total terminal height. */
  readonly height: number;
}

/**
 * Builds the list of configuration entries.
 * @param currentTheme - The current theme display name.
 * @param selectionMode - The current selection mode.
 * @returns The list of config entries.
 */
function buildEntries(currentTheme: string, selectionMode: SelectionMode): ConfigEntry[] {
  return [
    { label: "Theme", key: "theme", value: currentTheme },
    { label: "Selection Mode", key: "selectionMode", value: selectionMode },
  ];
}

/**
 * ConfigPopup shows a configuration menu for application settings.
 * @param root0 - The component props.
 * @param root0.cursor - Currently selected cursor index.
 * @param root0.currentTheme - Current theme display name.
 * @param root0.selectionMode - Current selection mode.
 * @param root0.width - Total terminal width.
 * @param root0.height - Total terminal height.
 * @returns The rendered config popup element.
 */
export function ConfigPopup({
  cursor,
  currentTheme,
  selectionMode,
  width,
  height,
}: ConfigPopupProps): React.ReactElement {
  const theme = useTheme();
  const boxWidth = Math.min(45, width - 6);
  const entries = buildEntries(currentTheme, selectionMode);

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width={width}
      height={height}
    >
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.borderActive}
        backgroundColor={theme.background}
        paddingX={2}
        paddingY={1}
        width={boxWidth}
      >
        <Text bold color={theme.primary}>
          Configuration
        </Text>
        <Text>{""}</Text>
        {entries.map((entry, idx) => {
          const isSelected = idx === cursor;
          const indicator = isSelected ? "\u25b8 " : "  ";
          const labelColor = isSelected ? theme.selectedText : theme.text;

          return (
            <Text key={entry.key}>
              <Text color={isSelected ? theme.primary : theme.textMuted}>{indicator}</Text>
              <Text color={labelColor} bold={isSelected}>
                {entry.label}
              </Text>
              <Text color={theme.textMuted}>{" \u2014 "}</Text>
              <Text color={theme.accent}>{entry.value}</Text>
            </Text>
          );
        })}
        <Text>{""}</Text>
        <Text color={theme.textMuted}>{"Enter: edit  Esc: close  \u2191/\u2193: navigate"}</Text>
      </Box>
    </Box>
  );
}

/** Total number of config entries. */
export const CONFIG_ENTRY_COUNT = 2;

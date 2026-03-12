// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../theme/context.js";
import type { ThemeName } from "../theme/types.js";
import { getThemeNames, THEMES } from "../theme/themes.js";

/** Maximum number of visible theme entries. */
const MAX_VISIBLE = 12;

/** Props for the ThemePopup component. */
interface ThemePopupProps {
  /** Currently selected cursor index. */
  readonly cursor: number;
  /** Currently active theme name. */
  readonly activeTheme: string;
  /** Total terminal width. */
  readonly width: number;
  /** Total terminal height. */
  readonly height: number;
}

/**
 * ThemePopup shows a list of available themes for selection.
 * @param root0 - The component props.
 * @param root0.cursor - Currently selected cursor index.
 * @param root0.activeTheme - Name of the currently active theme.
 * @param root0.width - Total terminal width.
 * @param root0.height - Total terminal height.
 * @returns The rendered theme popup element.
 */
export function ThemePopup({
  cursor,
  activeTheme,
  width,
  height,
}: ThemePopupProps): React.ReactElement {
  const theme = useTheme();
  const names = getThemeNames();
  const boxWidth = Math.min(40, width - 6);
  const boxHeight = Math.min(MAX_VISIBLE + 8, height - 4);

  const visibleCount = Math.min(MAX_VISIBLE, names.length);
  const halfVisible = Math.floor(visibleCount / 2);
  let start = Math.max(0, cursor - halfVisible);
  const end = Math.min(names.length, start + visibleCount);
  if (end - start < visibleCount) {
    start = Math.max(0, end - visibleCount);
  }

  const visible = names.slice(start, end);

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
        height={boxHeight}
      >
        <Text bold color={theme.primary}>
          Select Theme
        </Text>
        <Text>{""}</Text>
        {visible.map((name, idx) => {
          const realIdx = start + idx;
          const isSelected = realIdx === cursor;
          const isActive = THEMES[name].name === activeTheme;
          const indicator = isSelected ? "\u25b8 " : "  ";
          const color = isSelected ? theme.selectedText : theme.text;

          return (
            <Text key={`${name}-${realIdx}`} color={color} bold={isSelected}>
              {indicator}
              {THEMES[name].name}
              {isActive ? <Text color={theme.textSuccess}>{" \u2713"}</Text> : ""}
            </Text>
          );
        })}
        {names.length > visibleCount && (
          <Text color={theme.textMuted}>{`  ${cursor + 1}/${names.length}`}</Text>
        )}
        <Text>{""}</Text>
        <Text color={theme.textMuted}>{"Enter: apply  Esc: close  \u2191/\u2193: navigate"}</Text>
      </Box>
    </Box>
  );
}

/**
 * Returns the theme name at the given cursor index.
 * @param cursor - The cursor index.
 * @returns The theme name at that index, or undefined if out of bounds.
 */
export function getThemeAtCursor(cursor: number): ThemeName | undefined {
  const names = getThemeNames();
  return names[cursor];
}

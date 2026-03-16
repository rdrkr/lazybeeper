// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { TextAttributes } from "@opentui/core";
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
}: ThemePopupProps): React.ReactNode {
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
        borderStyle="single"
        borderColor={theme.borderActive}
        backgroundColor={theme.background}
        paddingX={2}
        paddingY={1}
        width={boxWidth}
        height={boxHeight}
      >
        <box flexDirection="row" justifyContent="space-between" width={boxWidth - 6}>
          <text attributes={TextAttributes.BOLD} fg={theme.primary}>
            Themes
          </text>
          <text fg={theme.textMuted}>esc</text>
        </box>
        <text>{""}</text>
        {visible.map((name, idx) => {
          const realIdx = start + idx;
          const isSelected = realIdx === cursor;
          const isActive = THEMES[name].name === activeTheme;
          const indicator = isSelected ? "\u25cf " : "  ";
          const color = isSelected ? theme.selectedText : theme.text;

          return (
            <text
              key={`${name}-${realIdx}`}
              fg={color}
              attributes={isSelected ? TextAttributes.BOLD : undefined}
            >
              {indicator}
              {THEMES[name].name}
              {isActive ? <span fg={theme.textSuccess}>{" \u25cf"}</span> : ""}
            </text>
          );
        })}
        {names.length > visibleCount && (
          <text fg={theme.textMuted}>{`  ${cursor + 1}/${names.length}`}</text>
        )}
        <text>{""}</text>
        <text fg={theme.textMuted}>{"enter apply  \u2191/\u2193 navigate"}</text>
      </box>
    </box>
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

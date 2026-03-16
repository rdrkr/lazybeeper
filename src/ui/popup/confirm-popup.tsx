// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { TextAttributes } from "@opentui/core";
import { useTheme } from "../theme/context.js";
import type { ChatAction } from "../viewmodel/messages.js";

/** Props for the ConfirmPopup component. */
interface ConfirmPopupProps {
  /** The question to display. */
  readonly message: string;
  /** The action being confirmed. */
  readonly action: ChatAction;
  /** Context data (e.g., chat ID). */
  readonly data: string;
  /** Currently selected button (0 = yes, 1 = no). */
  readonly selected: number;
  /** Callback to change selection. */
  readonly onSelectionChange: (selected: number) => void;
  /** Callback when confirmed or denied. */
  readonly onResult: (confirmed: boolean) => void;
  /** Total terminal width. */
  readonly width: number;
  /** Total terminal height. */
  readonly height: number;
}

/**
 * ConfirmPopup shows a yes/no confirmation dialog.
 * @param root0 - The component props.
 * @param root0.message - The question to display.
 * @param root0.selected - Currently selected button index.
 * @param root0.width - Total terminal width.
 * @param root0.height - Total terminal height.
 * @returns The rendered confirm popup element.
 */
export function ConfirmPopup({
  message,
  selected,
  width,
  height,
}: ConfirmPopupProps): React.ReactNode {
  const theme = useTheme();
  const boxWidth = Math.min(45, width - 6);

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
      >
        <box flexDirection="row" justifyContent="space-between" width={boxWidth - 6}>
          <text attributes={TextAttributes.BOLD} fg={theme.textWarning}>
            Confirm
          </text>
          <text fg={theme.textMuted}>esc</text>
        </box>
        <text>{""}</text>
        <text fg={theme.text}>{message}</text>
        <text>{""}</text>
        <box gap={2}>
          <text>{"  "}</text>
          {selected === 0 ? (
            <text
              attributes={TextAttributes.BOLD}
              fg={theme.selectedText}
              bg={theme.backgroundElement}
            >
              {"  Yes  "}
            </text>
          ) : (
            <text fg={theme.textMuted}>{"  Yes  "}</text>
          )}
          {selected === 1 ? (
            <text
              attributes={TextAttributes.BOLD}
              fg={theme.selectedText}
              bg={theme.backgroundElement}
            >
              {"  No  "}
            </text>
          ) : (
            <text fg={theme.textMuted}>{"  No  "}</text>
          )}
        </box>
        <text>{""}</text>
        <text fg={theme.textMuted}>{"y/n  \u2190/\u2192 + enter"}</text>
      </box>
    </box>
  );
}

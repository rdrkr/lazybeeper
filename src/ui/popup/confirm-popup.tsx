// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { Box, Text } from "ink";
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
}: ConfirmPopupProps): React.ReactElement {
  const theme = useTheme();
  const boxWidth = Math.min(45, width - 6);

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
        <Text bold color={theme.textWarning}>
          Confirm
        </Text>
        <Text>{""}</Text>
        <Text color={theme.text}>{message}</Text>
        <Text>{""}</Text>
        <Box gap={2}>
          <Text>{"  "}</Text>
          {selected === 0 ? (
            <Text bold color={theme.selectedText} backgroundColor={theme.backgroundElement}>
              {"  Yes  "}
            </Text>
          ) : (
            <Text color={theme.textMuted}>{"  Yes  "}</Text>
          )}
          {selected === 1 ? (
            <Text bold color={theme.selectedText} backgroundColor={theme.backgroundElement}>
              {"  No  "}
            </Text>
          ) : (
            <Text color={theme.textMuted}>{"  No  "}</Text>
          )}
        </Box>
        <Text>{""}</Text>
        <Text color={theme.textMuted}>{"y/n or \u2190/\u2192 + Enter"}</Text>
      </Box>
    </Box>
  );
}

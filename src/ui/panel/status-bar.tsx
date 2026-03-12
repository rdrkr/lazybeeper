// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { useTheme } from "../theme/context.js";
import { panelFocusName } from "../viewmodel/context.js";
import type { PanelFocus } from "../viewmodel/context.js";

/** How long errors are shown before auto-clearing (ms). */
const ERROR_DISPLAY_DURATION = 10_000;

/** Interval for checking error expiry (ms). */
const ERROR_CHECK_INTERVAL = 1_000;

/** Props for the StatusBar component. */
interface StatusBarProps {
  /** Total width. */
  readonly width: number;
  /** Current panel focus. */
  readonly focus: PanelFocus;
  /** Active chat name. */
  readonly chatName: string;
  /** Whether mock mode is active. */
  readonly isMock: boolean;
  /** Error message to display. */
  readonly errorMessage: string;
  /** Timestamp when the error was set. */
  readonly errorTime: number;
}

/**
 * StatusBar displays keybinding hints and connection status at the bottom.
 * Memoized to prevent unnecessary re-renders when sibling state changes.
 */
export const StatusBar = React.memo(function StatusBar({
  width,
  focus,
  chatName,
  isMock,
  errorMessage,
  errorTime,
}: StatusBarProps): React.ReactElement {
  const theme = useTheme();
  const [now, setNow] = useState<number>(Date.now);

  useEffect(() => {
    if (errorMessage === "") {
      return;
    }
    const id = setInterval(() => {
      setNow(Date.now());
    }, ERROR_CHECK_INTERVAL);
    return (): void => {
      clearInterval(id);
    };
  }, [errorMessage, errorTime]);

  const isErrorExpired = errorMessage !== "" && now - errorTime > ERROR_DISPLAY_DURATION;
  const activeError = errorMessage && !isErrorExpired ? errorMessage : "";

  const leftParts = [
    { key: "Tab", desc: "switch" },
    { key: "j/k", desc: "nav" },
    { key: "/", desc: "search" },
    { key: "c", desc: "config" },
    { key: "?", desc: "help" },
    { key: "q", desc: "quit" },
  ];

  const modeLabel = isMock ? "MOCK" : "LIVE";
  const modeColor = isMock ? theme.textWarning : theme.textSuccess;

  return (
    <Box width={width} height={1}>
      <Box flexGrow={1}>
        <Text backgroundColor={theme.statusBarBackground}>
          {" "}
          {leftParts.map((part, idx) => (
            <React.Fragment key={part.key}>
              {idx > 0 && " "}
              <Text bold color={theme.statusBarKey}>
                {part.key}
              </Text>{" "}
              <Text color={theme.statusBarText}>{part.desc}</Text>
            </React.Fragment>
          ))}
        </Text>
      </Box>
      <Box>
        <Text backgroundColor={theme.statusBarBackground}>
          {activeError ? (
            <Text bold color={theme.textError}>
              {"\u26a0 "}
              {activeError}
            </Text>
          ) : (
            <>
              <Text bold color={modeColor}>
                {modeLabel}
              </Text>
              <Text color={theme.borderSubtle}>{" \u2502 "}</Text>
              {chatName && <Text color={theme.textMuted}>{chatName} </Text>}
              <Text color={theme.statusBarText}>{panelFocusName(focus)}</Text>
            </>
          )}{" "}
        </Text>
      </Box>
    </Box>
  );
});

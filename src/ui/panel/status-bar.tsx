// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React, { useEffect, useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useTheme } from "../theme/context.js";
import { panelFocusName } from "../viewmodel/context.js";
import type { PanelFocus } from "../viewmodel/context.js";

/** Default duration errors are shown before auto-clearing (ms). */
const DEFAULT_ERROR_DURATION = 10_000;

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
  /** Duration in ms after which the error auto-clears (0 = default 10s). */
  readonly errorDuration: number;
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
  errorDuration,
}: StatusBarProps): React.ReactNode {
  const theme = useTheme();
  const [now, setNow] = useState<number>(Date.now);

  /** Effective duration: use provided value or fall back to the default. */
  const effectiveDuration = errorDuration > 0 ? errorDuration : DEFAULT_ERROR_DURATION;

  /* v8 ignore start -- timer re-render is exercised via SSR re-rendering with fake Date.now */
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
  /* v8 ignore stop */

  const isErrorExpired = errorMessage !== "" && now - errorTime > effectiveDuration;
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
    <box width={width} height={1} flexDirection="row">
      <box flexGrow={1}>
        <text bg={theme.statusBarBackground}>
          {" "}
          {leftParts.map((part, idx) => (
            <React.Fragment key={part.key}>
              {idx > 0 && " "}
              <span attributes={TextAttributes.BOLD} fg={theme.statusBarKey}>
                {part.key}
              </span>{" "}
              <span fg={theme.statusBarText}>{part.desc}</span>
            </React.Fragment>
          ))}
        </text>
      </box>
      <box>
        <text bg={theme.statusBarBackground}>
          {activeError ? (
            <span attributes={TextAttributes.BOLD} fg={theme.textError}>
              {"\u26a0 "}
              {activeError}
            </span>
          ) : (
            <>
              <span attributes={TextAttributes.BOLD} fg={modeColor}>
                {modeLabel}
              </span>
              <span fg={theme.borderSubtle}>{" \u2502 "}</span>
              {chatName && <span fg={theme.textMuted}>{chatName} </span>}
              <span fg={theme.statusBarText}>{panelFocusName(focus)}</span>
            </>
          )}{" "}
        </text>
      </box>
    </box>
  );
});

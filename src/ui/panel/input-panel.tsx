// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { TextAttributes } from "@opentui/core";
import { useTheme } from "../theme/context.js";
import { useStyle } from "../style/context.js";
import { Style } from "../../domain/config-file.js";

/** Props for the InputPanel component. */
interface InputPanelProps {
  /** Whether this panel has keyboard focus. */
  readonly focused: boolean;
  /** Panel width in characters. */
  readonly width: number;
  /** Panel height in characters. */
  readonly height: number;
  /** Current input value. */
  readonly value: string;
  /**
   * Callback fired on every keystroke to keep React state in sync.
   * Wired to OpenTUI's `onInput` event (not `onChange`, which only fires on blur).
   */
  readonly onInput: (value: string) => void;
  /** Callback when enter is pressed. */
  readonly onSubmit: (value: string) => void;
}

/**
 * InputPanel provides a text input area for composing messages.
 * Memoized to prevent unnecessary re-renders when sibling state changes.
 */
export const InputPanel = React.memo(function InputPanel({
  focused,
  width,
  height,
  value,
  onInput,
  onSubmit,
}: InputPanelProps): React.ReactNode {
  const theme = useTheme();
  const style = useStyle();
  const isModern = style === Style.Modern;
  const borderColor = focused ? theme.borderActive : theme.border;

  if (isModern) {
    return (
      <box
        flexDirection="row"
        width={width}
        height={height}
        backgroundColor={theme.backgroundPanel}
      >
        <text fg={focused ? theme.primary : theme.border}>{"\u2502"}</text>
        <box flexDirection="column" width={width - 1}>
          <text attributes={TextAttributes.BOLD} fg={theme.primary}>
            {" Input [4]"}
          </text>
          <box>
            {focused ? (
              <input
                focused={focused}
                value={value}
                onInput={onInput}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                onSubmit={onSubmit as any}
                placeholder="Type a message..."
              />
            ) : (
              <text fg={theme.textMuted}> {value || "Type a message..."}</text>
            )}
          </box>
        </box>
      </box>
    );
  }

  return (
    <box
      flexDirection="column"
      width={width}
      height={height}
      border={true}
      borderStyle="rounded"
      borderColor={borderColor}
    >
      <text attributes={TextAttributes.BOLD} fg={theme.primary}>
        {" Input [4]"}
      </text>
      <box>
        {focused ? (
          <input
            focused={focused}
            value={value}
            onInput={onInput}
            /*
             * OpenTUI emits onSubmit(string) at runtime, but the JSX type is
             * an intersection of three conflicting signatures (DOM SubmitEvent,
             * Textarea SubmitEvent, and InputProps string). Cast required.
             */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
            onSubmit={onSubmit as any}
            placeholder="Type a message..."
          />
        ) : (
          <text fg={theme.textMuted}>{value || "Type a message..."}</text>
        )}
      </box>
    </box>
  );
});

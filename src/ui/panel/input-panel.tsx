// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React, { useRef, useCallback } from "react";
import { TextAttributes } from "@opentui/core";
import { useTheme } from "../theme/context.js";
import { useStyle } from "../style/context.js";
import { Style } from "../../domain/config-file.js";
import { buildScrollbar } from "../../domain/textutil.js";

/**
 * Keybindings that map plain Enter to the submit action
 * and modifier+Enter combos to the newline action.
 * Uses OpenTUI's KeyBinding format: { name, ctrl?, shift?, meta?, action }.
 */
const TEXTAREA_KEY_BINDINGS = [
  { name: "return", action: "submit" },
  { name: "return", shift: true, action: "newline" },
  { name: "return", ctrl: true, action: "newline" },
  { name: "return", meta: true, action: "newline" },
];

/** Props for the InputPanel component. */
interface InputPanelProps {
  /** Whether this panel has keyboard focus. */
  readonly focused: boolean;
  /** Panel width in characters. */
  readonly width: number;
  /** Panel height in characters. */
  readonly height: number;
  /** Current input value (used for unfocused display; synced from textarea). */
  readonly value: string;
  /**
   * Callback fired on content change to keep React state in sync.
   * Used for unfocused display and the web build's controlled mode.
   */
  readonly onInput: (value: string) => void;
  /** Callback when enter is pressed to submit the message. */
  readonly onSubmit: (value: string) => void;
}

/**
 * Textarea ref type with access to the edit buffer for reading/clearing text.
 * Only available in the TUI build (OpenTUI's TextareaRenderable).
 */
interface TextareaRef {
  /** The underlying edit buffer. */
  readonly editBuffer: { getText: () => string };
  /** Resets the buffer text and clears undo history. */
  setText: (text: string) => void;
}

/**
 * InputPanel provides a multi-line text area for composing messages.
 * Uses OpenTUI's textarea (TUI) or HTML textarea (web via JSX runtime).
 * Plain Enter submits; modifier+Enter inserts a newline.
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

  /** Ref to the OpenTUI TextareaRenderable instance (TUI build only). */
  const textareaRef = useRef<TextareaRef | null>(null);

  /**
   * Handles the submit action from the textarea.
   * In TUI: gets text from the renderable's edit buffer.
   * In web: receives the text as a string argument from the JSX runtime.
   * @param textOrEvent - Text string (web) or SubmitEvent object (TUI).
   */
  /* v8 ignore start -- submit handler requires textarea interaction (web JSX runtime or TUI renderable) */
  const handleSubmit = useCallback(
    (textOrEvent?: string | object): void => {
      if (typeof textOrEvent === "string") {
        /* Web path: JSX runtime passes the value as a string. */
        onSubmit(textOrEvent);
        return;
      }
      /* TUI path: read text from the OpenTUI textarea's edit buffer. */
      const ref = textareaRef.current;
      if (ref?.editBuffer) {
        const text = ref.editBuffer.getText();
        onSubmit(text);
        ref.setText("");
      }
    },
    [onSubmit],
  );
  /* v8 ignore stop */

  /**
   * Syncs the textarea's internal content to React state.
   * Called on every content change in TUI so the unfocused display stays current.
   */
  /* v8 ignore start -- requires real OpenTUI TextareaRenderable in TUI build */
  const handleContentChange = useCallback((): void => {
    const ref = textareaRef.current;
    if (ref?.editBuffer) {
      onInput(ref.editBuffer.getText());
    }
  }, [onInput]);
  /* v8 ignore stop */

  /**
   * Builds the textarea element props for both TUI and web builds.
   * TUI uses: ref, focused, keyBindings, onSubmit, onContentChange, initialValue, placeholder.
   * Web uses: focused, value, onInput, onSubmit, placeholder (via JSX runtime conversion).
   * @returns Props object for the textarea element.
   */
  function buildTextareaProps(): Record<string, unknown> {
    return {
      ref: textareaRef,
      focused,
      value,
      onInput,
      initialValue: value,
      keyBindings: TEXTAREA_KEY_BINDINGS,
      onSubmit: handleSubmit,
      onContentChange: handleContentChange,
      placeholder: "Type a message...",
    };
  }

  /** Lines available for text content (height minus border and title). */
  const contentLines = Math.max(height - 3, 1);

  /** Line count of the current input value. */
  const valueLineCount = value ? value.split("\n").length : 0;

  /** Scrollbar characters (empty when content fits). */
  const scrollbar = buildScrollbar(
    valueLineCount,
    contentLines,
    Math.max(valueLineCount - contentLines, 0),
  );

  if (isModern) {
    /** Lines available for the accent bar (fills entire panel height minus borders). */
    const barLines = Math.max(height - 2, 1);

    /** Width for the textarea: panel width minus border(2) minus accent bar(1) minus scrollbar(1 if shown) minus paddingX(2). */
    const textareaWidth = width - 3 - (scrollbar.length > 0 ? 1 : 0);

    return (
      <box
        flexDirection="row"
        width={width}
        height={height}
        border={true}
        borderStyle="single"
        borderColor={focused ? theme.borderActive : theme.backgroundPanel}
        backgroundColor={theme.backgroundPanel}
      >
        <box flexDirection="column" width={1}>
          {Array.from({ length: barLines }, (_, i) => (
            <text key={`bar-${String(i)}`} fg={theme.primary}>
              {"\u2502"}
            </text>
          ))}
        </box>
        <box flexDirection="column" width={textareaWidth}>
          <text attributes={TextAttributes.BOLD} fg={theme.primary}>
            {" Input [4]"}
          </text>
          <box flexGrow={1} paddingX={1}>
            {focused ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <textarea {...(buildTextareaProps() as any)} />
            ) : (
              <text fg={theme.textMuted}>{value || "Type a message..."}</text>
            )}
          </box>
        </box>
        {scrollbar.length > 0 && (
          <box flexDirection="column" width={1}>
            {/* Title-line spacer so scrollbar aligns with content. */}
            <text> </text>
            {scrollbar.map((ch, i) => (
              <text key={`sb-${String(i)}`} fg={theme.textMuted}>
                {ch}
              </text>
            ))}
          </box>
        )}
      </box>
    );
  }

  /** Width for the textarea: panel width minus border(2) minus scrollbar(1 if shown). */
  const textareaWidth = width - (scrollbar.length > 0 ? 1 : 0);

  return (
    <box
      flexDirection="row"
      width={width}
      height={height}
      border={true}
      borderStyle="single"
      borderColor={borderColor}
    >
      <box flexDirection="column" width={textareaWidth - 2}>
        <text attributes={TextAttributes.BOLD} fg={theme.primary}>
          {" Input [4]"}
        </text>
        <box flexGrow={1} paddingX={1}>
          {focused ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <textarea {...(buildTextareaProps() as any)} />
          ) : (
            <text fg={theme.textMuted}>{value || "Type a message..."}</text>
          )}
        </box>
      </box>
      {scrollbar.length > 0 && (
        <box flexDirection="column" width={1}>
          {/* Title-line spacer so scrollbar aligns with content. */}
          <text> </text>
          {scrollbar.map((ch, i) => (
            <text key={`sb-${String(i)}`} fg={theme.textMuted}>
              {ch}
            </text>
          ))}
        </box>
      )}
    </box>
  );
});

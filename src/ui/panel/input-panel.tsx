// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "../theme/context.js";

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
  /** Callback when input value changes. */
  readonly onChange: (value: string) => void;
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
  onChange,
  onSubmit,
}: InputPanelProps): React.ReactElement {
  const theme = useTheme();
  const borderColor = focused ? theme.borderActive : theme.border;

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      borderStyle="round"
      borderColor={borderColor}
    >
      <Text bold color={theme.primary}>
        {" Input [4]"}
      </Text>
      <Box>
        {focused ? (
          <TextInput
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            placeholder="Type a message..."
          />
        ) : (
          <Text color={theme.textMuted}>{value || "Type a message..."}</Text>
        )}
      </Box>
    </Box>
  );
});

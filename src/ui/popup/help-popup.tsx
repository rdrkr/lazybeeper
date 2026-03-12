// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../theme/context.js";

/** Props for the HelpPopup component. */
interface HelpPopupProps {
  /** Total terminal width. */
  readonly width: number;
  /** Total terminal height. */
  readonly height: number;
}

/** Represents a keybinding entry in the help display. */
interface HelpBinding {
  /** The key combination. */
  readonly key: string;
  /** Description of the action. */
  readonly desc: string;
}

/** Represents a section of keybindings. */
interface HelpSection {
  /** Section title. */
  readonly title: string;
  /** Keybindings in this section. */
  readonly bindings: HelpBinding[];
}

/** All keybinding sections for the help popup. */
const HELP_SECTIONS: HelpSection[] = [
  {
    title: "Global",
    bindings: [
      { key: "q / Ctrl+C", desc: "Quit" },
      { key: "Tab / Shift+Tab", desc: "Cycle panels" },
      { key: "1-4", desc: "Jump to panel" },
      { key: "h / l", desc: "Left / right panel" },
      { key: "/", desc: "Search" },
      { key: "?", desc: "Help (this popup)" },
      { key: "c", desc: "Configuration" },
      { key: "r", desc: "Reload config" },
    ],
  },
  {
    title: "Lists (Accounts / Chats)",
    bindings: [
      { key: "j / k", desc: "Next / previous" },
      { key: "g / G", desc: "Top / bottom" },
      { key: "Enter", desc: "Select" },
    ],
  },
  {
    title: "Chats Panel",
    bindings: [
      { key: "a", desc: "Archive / unarchive" },
      { key: "m", desc: "Mute / unmute" },
      { key: "p", desc: "Pin / unpin" },
    ],
  },
  {
    title: "Messages",
    bindings: [
      { key: "j / k", desc: "Scroll down / up" },
      { key: "g / G", desc: "Top / bottom" },
      { key: "Enter", desc: "Focus input" },
    ],
  },
  {
    title: "Input",
    bindings: [
      { key: "Enter", desc: "Send message" },
      { key: "Esc", desc: "Exit to messages" },
    ],
  },
];

/** Maximum key column width across all sections for vertical alignment. */
const MAX_KEY_WIDTH = HELP_SECTIONS.reduce(
  (max, section) => section.bindings.reduce((m, b) => Math.max(m, b.key.length), max),
  0,
);

/**
 * HelpPopup shows a keybinding reference overlay.
 * @param root0 - The component props.
 * @param root0.width - Total terminal width.
 * @param root0.height - Total terminal height.
 * @returns The rendered help popup element.
 */
export function HelpPopup({ width, height }: HelpPopupProps): React.ReactElement {
  const theme = useTheme();
  const boxWidth = Math.min(50, width - 6);
  const boxHeight = Math.min(34, height - 4);

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
        overflow="hidden"
      >
        <Text bold color={theme.primary}>
          Keybinding Reference
        </Text>
        <Text>{""}</Text>
        {HELP_SECTIONS.map((section) => (
          <Box key={section.title} flexDirection="column" marginBottom={1}>
            <Text bold color={theme.secondary}>
              {section.title}
            </Text>
            {section.bindings.map((bind) => (
              <Text key={bind.key}>
                {"  "}
                <Text bold color={theme.accent}>
                  {bind.key.padEnd(MAX_KEY_WIDTH)}
                </Text>
                {"  "}
                <Text color={theme.textMuted}>{bind.desc}</Text>
              </Text>
            ))}
          </Box>
        ))}
        <Text color={theme.textMuted}>{"Press Esc or ? to close"}</Text>
      </Box>
    </Box>
  );
}

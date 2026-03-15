// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { TextAttributes } from "@opentui/core";
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
export function HelpPopup({ width, height }: HelpPopupProps): React.ReactNode {
  const theme = useTheme();
  const boxWidth = Math.min(50, width - 6);
  const boxHeight = Math.min(34, height - 4);

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
        borderStyle="rounded"
        borderColor={theme.borderActive}
        backgroundColor={theme.background}
        paddingX={2}
        paddingY={1}
        width={boxWidth}
        height={boxHeight}
        overflow="hidden"
      >
        <text attributes={TextAttributes.BOLD} fg={theme.primary}>
          Keybinding Reference
        </text>
        <text>{""}</text>
        {HELP_SECTIONS.map((section, sectionIdx) => (
          <React.Fragment key={section.title}>
            {sectionIdx > 0 && <text>{""}</text>}
            <text attributes={TextAttributes.BOLD} fg={theme.secondary}>
              {section.title}
            </text>
            {section.bindings.map((bind) => (
              <text key={bind.key}>
                {"  "}
                <span attributes={TextAttributes.BOLD} fg={theme.accent}>
                  {bind.key.padEnd(MAX_KEY_WIDTH)}
                </span>
                {"  "}
                <span fg={theme.textMuted}>{bind.desc}</span>
              </text>
            ))}
          </React.Fragment>
        ))}
        <text fg={theme.textMuted}>{"Press Esc or ? to close"}</text>
      </box>
    </box>
  );
}

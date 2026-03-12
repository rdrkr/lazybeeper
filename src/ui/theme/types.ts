// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Complete color theme definition for the application UI.
 * Each slot maps to a specific semantic role in the interface.
 */
export interface Theme {
  /** Human-readable theme name. */
  readonly name: string;

  /* --- Backgrounds --- */

  /** Main application background. */
  readonly background: string;
  /** Panel/card background. */
  readonly backgroundPanel: string;
  /** Interactive element background (buttons, inputs). */
  readonly backgroundElement: string;

  /* --- Text --- */

  /** Primary foreground text. */
  readonly text: string;
  /** Secondary/muted text. */
  readonly textMuted: string;
  /** Informational messages. */
  readonly textInfo: string;
  /** Error messages. */
  readonly textError: string;
  /** Warning messages. */
  readonly textWarning: string;
  /** Success messages. */
  readonly textSuccess: string;

  /* --- Borders --- */

  /** Standard/unfocused border. */
  readonly border: string;
  /** Active/focused border. */
  readonly borderActive: string;
  /** Subtle/faint border. */
  readonly borderSubtle: string;

  /* --- Accent --- */

  /** Primary accent color (headings, active items). */
  readonly primary: string;
  /** Secondary accent color. */
  readonly secondary: string;
  /** Tertiary accent color. */
  readonly accent: string;

  /* --- Selection --- */

  /** Selected item background. */
  readonly selectedBackground: string;
  /** Selected item text. */
  readonly selectedText: string;
  /** Cursor/focus indicator (e.g., ">"). */
  readonly cursorIndicator: string;

  /* --- Status indicators --- */

  /** Connected state dot. */
  readonly connected: string;
  /** Disconnected state dot. */
  readonly disconnected: string;

  /* --- Messages --- */

  /** Own message sender name. */
  readonly ownMessageName: string;
  /** Other sender name. */
  readonly otherMessageName: string;
  /** Message body text. */
  readonly messageText: string;
  /** Timestamp text. */
  readonly timestamp: string;
  /** Date separator line and label. */
  readonly dateSeparator: string;

  /* --- Status bar --- */

  /** Status bar background. */
  readonly statusBarBackground: string;
  /** Status bar text. */
  readonly statusBarText: string;
  /** Status bar keybinding labels. */
  readonly statusBarKey: string;

  /* --- Badges & indicators --- */

  /** Unread count badge. */
  readonly unreadBadge: string;
  /** Pinned chat indicator. */
  readonly pinnedIndicator: string;
  /** Muted chat indicator. */
  readonly mutedIndicator: string;
}

/** Name of a built-in theme. */
export type ThemeName =
  | "catppuccin-mocha"
  | "catppuccin-macchiato"
  | "catppuccin-frappe"
  | "catppuccin-latte"
  | "tokyo-night"
  | "tokyo-night-storm"
  | "dracula"
  | "nord"
  | "gruvbox-dark"
  | "one-dark";

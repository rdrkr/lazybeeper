// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Web shim for `\@opentui/core`.
 * Provides the TextAttributes enum used by UI components for text styling.
 */

/** Bitmask flags for text rendering attributes. */
export enum TextAttributes {
  /** Normal (no special styling). */
  NONE = 0,
  /** Bold text. */
  BOLD = 1,
  /** Dim/faint text. */
  DIM = 2,
  /** Italic text. */
  ITALIC = 4,
  /** Underlined text. */
  UNDERLINE = 8,
}

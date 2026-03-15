// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Mock for `\@opentui/core`.
 * Provides the TextAttributes enum used in UI components without importing
 * Bun-native FFI bindings (which are incompatible with Node.js/Vitest).
 */

/** Terminal text styling attributes bitfield, matching OpenTUI's values. */
export enum TextAttributes {
  BOLD = 1,
  DIM = 2,
  ITALIC = 4,
  UNDERLINE = 8,
  BLINK = 16,
  INVERSE = 32,
  HIDDEN = 64,
  STRIKETHROUGH = 128,
}

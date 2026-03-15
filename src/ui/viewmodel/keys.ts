// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Key constants for the application keybindings.
 * Maps to the Go KeyMap structure.
 */

/**
 * KeyInfo represents the metadata about a key press from OpenTUI's useKeyboard hook.
 * All fields are optional to allow partial fixture objects in tests.
 */
export interface KeyInfo {
  /** Key name: "a", "up", "down", "left", "right", "return", "escape", "tab", etc. */
  readonly name?: string;
  /** Whether the Ctrl modifier was held. */
  readonly ctrl?: boolean;
  /** Whether the Shift modifier was held. */
  readonly shift?: boolean;
  /** Whether the Meta/Alt modifier was held. */
  readonly meta?: boolean;
}

/**
 * Checks if the key matches the quit key (q).
 * @param key - Metadata about the key press.
 * @returns True if the key is the quit key.
 */
export function isQuitKey(key: KeyInfo): boolean {
  return key.name === "q";
}

/**
 * Checks if the key matches the interrupt key (ctrl+c).
 * @param key - Metadata about the key press.
 * @returns True if the key is Ctrl+C.
 */
export function isInterruptKey(key: KeyInfo): boolean {
  return key.ctrl === true && key.name === "c";
}

/**
 * Checks if the key matches the tab key (without shift).
 * @param key - Metadata about the key press.
 * @returns True if the key is Tab without Shift.
 */
export function isTabKey(key: KeyInfo): boolean {
  return key.name === "tab" && !key.shift;
}

/**
 * Checks if the key matches shift+tab.
 * @param key - Metadata about the key press.
 * @returns True if the key is Shift+Tab.
 */
export function isShiftTabKey(key: KeyInfo): boolean {
  return (key.shift ?? false) && key.name === "tab";
}

/**
 * Checks if the key matches a left movement key (h).
 * @param key - Metadata about the key press.
 * @returns True if the key is a left movement key.
 */
export function isLeftKey(key: KeyInfo): boolean {
  return key.name === "h";
}

/**
 * Checks if the key matches a right movement key (l).
 * @param key - Metadata about the key press.
 * @returns True if the key is a right movement key.
 */
export function isRightKey(key: KeyInfo): boolean {
  return key.name === "l";
}

/**
 * Checks if the key matches an up movement key (k or up arrow).
 * @param key - Metadata about the key press.
 * @returns True if the key is an up movement key.
 */
export function isUpKey(key: KeyInfo): boolean {
  return key.name === "k" || key.name === "up";
}

/**
 * Checks if the key matches a down movement key (j or down arrow).
 * @param key - Metadata about the key press.
 * @returns True if the key is a down movement key.
 */
export function isDownKey(key: KeyInfo): boolean {
  return key.name === "j" || key.name === "down";
}

/**
 * Checks if the key matches the enter/return key.
 * @param key - Metadata about the key press.
 * @returns True if the key is Enter/Return.
 */
export function isEnterKey(key: KeyInfo): boolean {
  return key.name === "return";
}

/**
 * Checks if the key matches the escape key.
 * @param key - Metadata about the key press.
 * @returns True if the key is Escape.
 */
export function isEscapeKey(key: KeyInfo): boolean {
  return key.name === "escape";
}

/**
 * Checks if the key matches the search key (/).
 * Excludes shift+/ (which is ?) to avoid conflict with isHelpKey.
 * @param key - Metadata about the key press.
 * @returns True if the key is the search key.
 */
export function isSearchKey(key: KeyInfo): boolean {
  return key.name === "/" && !key.shift;
}

/**
 * Checks if the key matches the help key (?).
 * Handles both direct ? and shift+/ representations from different terminals.
 * @param key - Metadata about the key press.
 * @returns True if the key is the help key.
 */
export function isHelpKey(key: KeyInfo): boolean {
  return key.name === "?" || (key.name === "/" && key.shift === true);
}

/**
 * Checks if the key matches a jump-to-panel key (1-4).
 * @param key - Metadata about the key press.
 * @returns The zero-based panel index, or null if not a jump key.
 */
export function getJumpPanel(key: KeyInfo): number | null {
  if (key.name !== undefined && key.name >= "1" && key.name <= "4") {
    return parseInt(key.name, 10) - 1;
  }
  return null;
}

/**
 * Checks if the key matches the top key (g).
 * Excludes shift+g (which is G) to avoid conflict with isBottomKey.
 * @param key - Metadata about the key press.
 * @returns True if the key is the top key.
 */
export function isTopKey(key: KeyInfo): boolean {
  return key.name === "g" && !key.shift;
}

/**
 * Checks if the key matches the bottom key (G).
 * Handles both direct G and shift+g representations from different terminals.
 * @param key - Metadata about the key press.
 * @returns True if the key is the bottom key.
 */
export function isBottomKey(key: KeyInfo): boolean {
  return key.name === "G" || (key.name === "g" && key.shift === true);
}

/**
 * Checks if the key matches the archive key (a).
 * @param key - Metadata about the key press.
 * @returns True if the key is the archive key.
 */
export function isArchiveKey(key: KeyInfo): boolean {
  return key.name === "a";
}

/**
 * Checks if the key matches the mute key (m).
 * @param key - Metadata about the key press.
 * @returns True if the key is the mute key.
 */
export function isMuteKey(key: KeyInfo): boolean {
  return key.name === "m";
}

/**
 * Checks if the key matches the pin key (p).
 * @param key - Metadata about the key press.
 * @returns True if the key is the pin key.
 */
export function isPinKey(key: KeyInfo): boolean {
  return key.name === "p";
}

/**
 * Checks if the key matches the yes key (y).
 * @param key - Metadata about the key press.
 * @returns True if the key is the yes key.
 */
export function isYesKey(key: KeyInfo): boolean {
  return key.name === "y";
}

/**
 * Checks if the key matches the no key (n).
 * @param key - Metadata about the key press.
 * @returns True if the key is the no key.
 */
export function isNoKey(key: KeyInfo): boolean {
  return key.name === "n";
}

/**
 * Checks if the key matches the config key (c).
 * @param key - Metadata about the key press.
 * @returns True if the key is the config key.
 */
export function isConfigKey(key: KeyInfo): boolean {
  return key.name === "c";
}

/**
 * Checks if the key matches the reload config key (r).
 * @param key - Metadata about the key press.
 * @returns True if the key is the reload config key.
 */
export function isReloadConfigKey(key: KeyInfo): boolean {
  return key.name === "r";
}

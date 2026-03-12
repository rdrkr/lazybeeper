// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Key constants for the application keybindings.
 * Maps to the Go KeyMap structure.
 */

/**
 * Checks if the input matches the quit key (q).
 * @param input - The raw input string.
 * @returns True if the key is the quit key.
 */
export function isQuitKey(input: string): boolean {
  return input === "q";
}

/**
 * Checks if the input matches the interrupt key (ctrl+c).
 * @param input - The raw input string.
 * @param key - Metadata about the key press.
 * @returns True if the key is Ctrl+C.
 */
export function isInterruptKey(input: string, key: KeyInfo): boolean {
  return key.ctrl === true && input === "c";
}

/**
 * Checks if the input matches the tab key (without shift).
 * @param _input - The raw input string (unused).
 * @param key - Metadata about the key press.
 * @returns True if the key is Tab without Shift.
 */
export function isTabKey(_input: string, key: KeyInfo): boolean {
  return key.tab === true && !key.shift;
}

/**
 * Checks if the input matches shift+tab.
 * @param _input - The raw input string (unused).
 * @param key - Metadata about the key press.
 * @returns True if the key is Shift+Tab.
 */
export function isShiftTabKey(_input: string, key: KeyInfo): boolean {
  return (key.shift ?? false) && (key.tab ?? false);
}

/**
 * Checks if the input matches a left movement key (h).
 * @param input - The raw input string.
 * @returns True if the key is a left movement key.
 */
export function isLeftKey(input: string): boolean {
  return input === "h";
}

/**
 * Checks if the input matches a right movement key (l).
 * @param input - The raw input string.
 * @returns True if the key is a right movement key.
 */
export function isRightKey(input: string): boolean {
  return input === "l";
}

/**
 * Checks if the input matches an up movement key (k or up arrow).
 * @param input - The raw input string.
 * @param key - Metadata about the key press.
 * @returns True if the key is an up movement key.
 */
export function isUpKey(input: string, key: KeyInfo): boolean {
  return input === "k" || key.upArrow === true;
}

/**
 * Checks if the input matches a down movement key (j or down arrow).
 * @param input - The raw input string.
 * @param key - Metadata about the key press.
 * @returns True if the key is a down movement key.
 */
export function isDownKey(input: string, key: KeyInfo): boolean {
  return input === "j" || key.downArrow === true;
}

/**
 * Checks if the input matches the enter/return key.
 * @param _input - The raw input string (unused).
 * @param key - Metadata about the key press.
 * @returns True if the key is Enter/Return.
 */
export function isEnterKey(_input: string, key: KeyInfo): boolean {
  return key.return === true;
}

/**
 * Checks if the input matches the escape key.
 * @param _input - The raw input string (unused).
 * @param key - Metadata about the key press.
 * @returns True if the key is Escape.
 */
export function isEscapeKey(_input: string, key: KeyInfo): boolean {
  return key.escape === true;
}

/**
 * Checks if the input matches the search key (/).
 * @param input - The raw input string.
 * @returns True if the key is the search key.
 */
export function isSearchKey(input: string): boolean {
  return input === "/";
}

/**
 * Checks if the input matches the help key (?).
 * @param input - The raw input string.
 * @returns True if the key is the help key.
 */
export function isHelpKey(input: string): boolean {
  return input === "?";
}

/**
 * Checks if the input matches a jump-to-panel key (1-4).
 * @param input - The raw input string.
 * @returns The zero-based panel index, or null if not a jump key.
 */
export function getJumpPanel(input: string): number | null {
  if (input >= "1" && input <= "4") {
    return parseInt(input, 10) - 1;
  }
  return null;
}

/**
 * Checks if the input matches the top key (g).
 * @param input - The raw input string.
 * @returns True if the key is the top key.
 */
export function isTopKey(input: string): boolean {
  return input === "g";
}

/**
 * Checks if the input matches the bottom key (G).
 * @param input - The raw input string.
 * @returns True if the key is the bottom key.
 */
export function isBottomKey(input: string): boolean {
  return input === "G";
}

/**
 * Checks if the input matches the archive key (a).
 * @param input - The raw input string.
 * @returns True if the key is the archive key.
 */
export function isArchiveKey(input: string): boolean {
  return input === "a";
}

/**
 * Checks if the input matches the mute key (m).
 * @param input - The raw input string.
 * @returns True if the key is the mute key.
 */
export function isMuteKey(input: string): boolean {
  return input === "m";
}

/**
 * Checks if the input matches the pin key (p).
 * @param input - The raw input string.
 * @returns True if the key is the pin key.
 */
export function isPinKey(input: string): boolean {
  return input === "p";
}

/**
 * Checks if the input matches the yes key (y).
 * @param input - The raw input string.
 * @returns True if the key is the yes key.
 */
export function isYesKey(input: string): boolean {
  return input === "y";
}

/**
 * Checks if the input matches the no key (n).
 * @param input - The raw input string.
 * @returns True if the key is the no key.
 */
export function isNoKey(input: string): boolean {
  return input === "n";
}

/**
 * Checks if the input matches the config key (c).
 * @param input - The raw input string.
 * @returns True if the key is the config key.
 */
export function isConfigKey(input: string): boolean {
  return input === "c";
}

/**
 * Checks if the input matches the reload config key (r).
 * @param input - The raw input string.
 * @returns True if the key is the reload config key.
 */
export function isReloadConfigKey(input: string): boolean {
  return input === "r";
}

/**
 * KeyInfo represents the metadata about a key press from Ink's useInput hook.
 */
export interface KeyInfo {
  readonly upArrow?: boolean;
  readonly downArrow?: boolean;
  readonly leftArrow?: boolean;
  readonly rightArrow?: boolean;
  readonly return?: boolean;
  readonly escape?: boolean;
  readonly ctrl?: boolean;
  readonly shift?: boolean;
  readonly tab?: boolean;
  readonly meta?: boolean;
}

// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Web-compatible config file module using localStorage.
 * Re-exports the pure enums and types from the domain module and provides
 * browser-compatible read/write functions backed by localStorage.
 */

/** localStorage key for persisted config. */
const STORAGE_KEY = "lazybeeper-config";

/** Selection behavior when navigating lists. */
export enum SelectionMode {
  /** Highlighted item is selected immediately on cursor move. */
  Navigate = "navigate",
  /** Enter key is required to select the highlighted item. */
  Enter = "enter",
}

/** Chat list layout density. */
export enum ChatListStyle {
  /** Two-line layout with inline initials on the name line. */
  Compact = "compact",
  /** Three-line layout with square avatar spanning two lines. */
  Comfortable = "comfortable",
}

/** Visual rendering style. */
export enum Style {
  /** Flat design with borders separating panels. */
  Retro = "retro",
  /** Background-based panels, message bubbles, popup dimming. */
  Modern = "modern",
}

/** Represents the persisted configuration. */
export interface ConfigFile {
  /** Color theme name. */
  readonly theme: string;
  /** Selection behavior for accounts and chats panels. */
  readonly selectionMode: SelectionMode;
  /** Chat list layout density. */
  readonly chatListStyle: ChatListStyle;
  /** Visual rendering style. */
  readonly style: Style;
}

/** Default configuration values. */
export const DEFAULT_CONFIG: ConfigFile = {
  theme: "catppuccin-mocha",
  selectionMode: SelectionMode.Enter,
  chatListStyle: ChatListStyle.Comfortable,
  style: Style.Modern,
};

/**
 * Returns the config directory path (not applicable in browser).
 * @returns A placeholder string.
 */
export function configDir(): string {
  return "(browser)";
}

/**
 * Returns the config file path (not applicable in browser).
 * @returns A placeholder string.
 */
export function configFilePath(): string {
  return "(browser localStorage)";
}

/**
 * Reads configuration from localStorage.
 * Returns defaults if no stored config exists.
 * @returns The parsed configuration.
 */
export function readConfigFile(): ConfigFile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_CONFIG };
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      theme: typeof parsed.theme === "string" ? parsed.theme : DEFAULT_CONFIG.theme,
      selectionMode: parseEnum(
        parsed.selectionMode,
        [SelectionMode.Navigate, SelectionMode.Enter],
        DEFAULT_CONFIG.selectionMode,
      ),
      chatListStyle: parseEnum(
        parsed.chatListStyle,
        [ChatListStyle.Compact, ChatListStyle.Comfortable],
        DEFAULT_CONFIG.chatListStyle,
      ),
      style: parseEnum(parsed.style, [Style.Retro, Style.Modern], DEFAULT_CONFIG.style),
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Writes configuration to localStorage.
 * @param config - The configuration to persist.
 */
export function writeConfigFile(config: ConfigFile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* Silently ignore write failures (e.g. quota exceeded). */
  }
}

/**
 * Updates a single key in the stored config while preserving other values.
 * @param key - The config key to update.
 * @param value - The new value to set.
 */
export function updateConfigFileKey(key: keyof ConfigFile, value: string): void {
  const current = readConfigFile();
  writeConfigFile({ ...current, [key]: value as never });
}

/**
 * Resets the stored config to default values.
 */
export function resetConfigFile(): void {
  writeConfigFile(DEFAULT_CONFIG);
}

/**
 * Parses a raw value against a list of valid enum values.
 * @param value - The raw value to parse.
 * @param valid - The list of valid enum values.
 * @param fallback - The default value if parsing fails.
 * @returns The parsed enum value or the fallback.
 */
function parseEnum<T extends string>(value: unknown, valid: T[], fallback: T): T {
  if (typeof value === "string" && valid.includes(value as T)) {
    return value as T;
  }
  return fallback;
}

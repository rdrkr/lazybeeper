// Copyright (c) 2026 lazybeeper by Ronen Druker.

import * as fs from "node:fs";
import * as path from "node:path";
import * as TOML from "smol-toml";

/** Default config directory name under XDG_CONFIG_HOME. */
const APP_DIR = "lazybeeper";

/** Config file name. */
const CONFIG_FILE = "config.toml";

/** Selection behavior when navigating lists. */
export enum SelectionMode {
  /** Highlighted item is selected immediately on cursor move. */
  Navigate = "navigate",
  /** Enter key is required to select the highlighted item. */
  Enter = "enter",
}

/** Represents the persisted TOML configuration. */
export interface ConfigFile {
  /** Color theme name. */
  readonly theme: string;
  /** Selection behavior for accounts and chats panels. */
  readonly selectionMode: SelectionMode;
}

/** Default configuration values. */
const DEFAULT_CONFIG: ConfigFile = {
  theme: "catppuccin-mocha",
  selectionMode: SelectionMode.Enter,
};

/**
 * Returns the path to the config directory, respecting XDG_CONFIG_HOME.
 * Falls back to ~/.config/lazybeeper.
 * @returns The absolute path to the config directory.
 */
export function configDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg ?? path.join(process.env.HOME ?? "~", ".config");
  return path.join(base, APP_DIR);
}

/**
 * Returns the full path to the config TOML file.
 * @returns The absolute path to the config file.
 */
export function configFilePath(): string {
  return path.join(configDir(), CONFIG_FILE);
}

/**
 * Reads and parses the TOML config file.
 * Creates a default config file if it does not exist.
 * @returns The parsed configuration.
 */
export function readConfigFile(): ConfigFile {
  const filePath = configFilePath();

  if (!fs.existsSync(filePath)) {
    writeConfigFile(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = TOML.parse(raw) as Record<string, unknown>;
    const config: ConfigFile = {
      theme: typeof parsed.theme === "string" ? parsed.theme : DEFAULT_CONFIG.theme,
      selectionMode: parseSelectionMode(parsed.selection_mode),
    };

    /* Write back if the file is missing any expected keys. */
    if (!hasAllKeys(parsed)) {
      writeConfigFile(config);
    }

    return config;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Writes the configuration to the TOML config file.
 * Creates the config directory if it does not exist.
 * @param config - The configuration to persist.
 */
export function writeConfigFile(config: ConfigFile): void {
  const dir = configDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = TOML.stringify({
    theme: config.theme,
    selection_mode: config.selectionMode,
  });
  fs.writeFileSync(configFilePath(), content, "utf-8");
}

/** TOML keys expected in the config file. */
const EXPECTED_KEYS: readonly string[] = ["theme", "selection_mode"];

/**
 * Returns true if the parsed TOML object contains all expected config keys.
 * @param parsed - The raw parsed TOML object.
 * @returns Whether all expected keys are present.
 */
function hasAllKeys(parsed: Record<string, unknown>): boolean {
  return EXPECTED_KEYS.every((key) => key in parsed);
}

/**
 * Parses a raw value into a SelectionMode enum.
 * @param value - The raw value from config file.
 * @returns The parsed SelectionMode, falling back to the default.
 */
function parseSelectionMode(value: unknown): SelectionMode {
  if (typeof value === "string") {
    const validValues: string[] = [SelectionMode.Navigate, SelectionMode.Enter];
    if (validValues.includes(value)) {
      return value as SelectionMode;
    }
  }
  return DEFAULT_CONFIG.selectionMode;
}

/**
 * Updates a single key in the config file while preserving other values.
 * @param key - The config key to update.
 * @param value - The new value to set.
 */
export function updateConfigFileKey(key: keyof ConfigFile, value: string): void {
  const current = readConfigFile();
  writeConfigFile({ ...current, [key]: value as never });
}

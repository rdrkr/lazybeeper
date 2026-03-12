// Copyright (c) 2026 lazybeeper by Ronen Druker.

/** Default address for the Beeper Desktop local API. */
export const DEFAULT_BASE_URL = "http://localhost:23373";

/**
 * Config holds application-level configuration.
 */
export interface Config {
  /** Beeper API authentication token. */
  readonly token: string;
  /** Base URL for the Beeper Desktop API. */
  readonly baseUrl: string;
  /** Name of the color theme to use. */
  readonly theme: string;
}

/**
 * Loads a Config by merging CLI flags with environment variables.
 * CLI flags take precedence over environment variables.
 * @param flagToken - The API token provided via CLI flag, or empty string if not set.
 * @param flagBaseUrl - The base URL provided via CLI flag, or empty string if not set.
 * @param flagTheme - The theme name provided via CLI flag, or empty string if not set.
 * @returns The merged configuration.
 */
export function loadConfig(flagToken: string, flagBaseUrl: string, flagTheme: string): Config {
  let token = process.env.BEEPER_TOKEN ?? "";
  let baseUrl = DEFAULT_BASE_URL;
  let theme = process.env.LAZYBEEPER_THEME ?? "catppuccin-mocha";

  const envUrl = process.env.BEEPER_URL;
  if (envUrl) {
    baseUrl = envUrl;
  }

  if (flagToken !== "") {
    token = flagToken;
  }

  if (flagBaseUrl !== "") {
    baseUrl = flagBaseUrl;
  }

  if (flagTheme !== "") {
    theme = flagTheme;
  }

  return { token, baseUrl, theme };
}

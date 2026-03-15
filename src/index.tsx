#!/usr/bin/env node
// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./ui/app.js";
import { loadConfig } from "./domain/config.js";
import { readConfigFile } from "./domain/config-file.js";
import { ApiClient } from "./data/client.js";
import { detectKittyGraphics, isKittySupported, deleteAllImages } from "./ui/kitty.js";
import { resolveTheme } from "./ui/theme/index.js";

/**
 * Parses command-line arguments for --token, --url, and --theme flags.
 * @param argv - The process argument vector to parse.
 * @returns The parsed token, url, and theme values.
 */
function parseArgs(argv: string[]): { token: string; url: string; theme: string } {
  let token = "";
  let url = "";
  let theme = "";

  for (let idx = 2; idx < argv.length; idx++) {
    const arg = argv[idx];
    const next = argv[idx + 1];

    if (arg === "--token" && next !== undefined) {
      token = next;
      idx++;
    } else if (arg === "--url" && next !== undefined) {
      url = next;
      idx++;
    } else if (arg === "--theme" && next !== undefined) {
      theme = next;
      idx++;
    }
  }

  return { token, url, theme };
}

const args = parseArgs(process.argv);

/* Read persisted config file (creates default if missing). */
const configFile = readConfigFile();

/*
 * Theme resolution priority: CLI flag > env var > config file > default.
 * loadConfig handles CLI flag > env var. We inject the config file theme
 * as the env fallback when neither CLI nor env is set.
 */
// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string means "not set"
const effectiveThemeFlag = args.theme || process.env.LAZYBEEPER_THEME || configFile.theme;
const config = loadConfig(args.token, args.url, effectiveThemeFlag);
const client = new ApiClient(config);
const theme = resolveTheme(config.theme);

/* Detect Kitty graphics protocol support before the renderer takes over stdin. */
await detectKittyGraphics();

/* Create OpenTUI renderer — it owns the alternate screen and Ctrl-C handling. */
const renderer = await createCliRenderer({ exitOnCtrlC: false, useAlternateScreen: true });
const root = createRoot(renderer);

/*
 * Disable threaded I/O so that the Zig renderer writes synchronously on
 * the main thread. Kitty graphics overlays are written directly to stdout
 * via process.stdout.write(); with threading enabled (the default on macOS),
 * the Zig I/O thread can interleave with these writes, corrupting the APC
 * escape sequences that carry image data.
 */
renderer.useThread = false;

/**
 * Cleanly shuts down the application by unmounting the React tree,
 * destroying the renderer (which restores terminal state: alternate screen,
 * raw mode, kitty keyboard protocol, mouse mode), and exiting the process.
 */
function quit(): void {
  if (isKittySupported()) {
    deleteAllImages();
  }
  root.unmount();
  renderer.destroy();
  process.exit(0);
}

root.render(
  <App repo={client} theme={theme} selectionMode={configFile.selectionMode} onQuit={quit} />,
);

#!/usr/bin/env node
// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { render } from "ink";
import { App } from "./ui/app.js";
import { loadConfig } from "./domain/config.js";
import { readConfigFile } from "./domain/config-file.js";
import { ApiClient } from "./data/client.js";
import { enableSynchronizedOutput } from "./ui/terminal.js";
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

/* Detect Kitty graphics protocol support before Ink takes over stdin. */
await detectKittyGraphics();

/* Wrap stdout in DEC 2026 synchronized output to prevent flickering in tmux. */
enableSynchronizedOutput(process.stdout);

/* Enter alternate screen buffer so the app leaves no trace on exit. */
process.stdout.write("\x1b[?1049h");

/* Clean up on exit: delete Kitty images and leave alternate screen buffer. */
process.on("exit", () => {
  if (isKittySupported()) {
    deleteAllImages();
  }
  process.stdout.write("\x1b[?1049l");
});

render(<App repo={client} theme={theme} selectionMode={configFile.selectionMode} />);

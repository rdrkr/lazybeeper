// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Web entry point for lazybeeper.
 * Renders the same App component used by the terminal version using
 * react-dom, with mock data and browser-compatible shims.
 */

import { createRoot } from "react-dom/client";
import { App } from "../ui/app.js";
import { MockClient } from "../data/mock/client.js";
import { resolveTheme } from "../ui/theme/themes.js";
import { readConfigFile } from "./config-file.js";

/** Read persisted config from localStorage (creates defaults if missing). */
const configFile = readConfigFile();

/** Resolved color theme. */
const theme = resolveTheme(configFile.theme);

/** Apply theme colors and app padding to the document root via CSS custom properties. */
document.documentElement.style.setProperty("--tui-bg", theme.background);
document.documentElement.style.setProperty("--tui-fg", theme.text);
document.documentElement.style.setProperty("--tui-app-padding", "16px");

/** Mock data repository for the browser. */
const client = new MockClient();

/** Root DOM element for the React application. */
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root not found");
}

/** React root instance. */
const root = createRoot(container);

/**
 * Handles the quit action in browser mode by replacing the app
 * with a "closed" message.
 */
function handleQuit(): void {
  root.render(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        color: "var(--tui-fg, #cdd6f4)",
        fontFamily: "var(--tui-font, monospace)",
      }}
    >
      lazybeeper closed. Refresh to restart.
    </div>,
  );
}

root.render(
  <App
    repo={client}
    theme={theme}
    selectionMode={configFile.selectionMode}
    chatListStyle={configFile.chatListStyle}
    style={configFile.style}
    onQuit={handleQuit}
  />,
);

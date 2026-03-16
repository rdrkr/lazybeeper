#!/usr/bin/env bun
// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Web build script for lazybeeper.
 * Uses Bun.build with plugins to alias terminal-specific modules
 * with browser-compatible shims, producing a single-file bundle.
 */

import { resolve, dirname } from "node:path";
import { copyFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import type { BunPlugin } from "bun";

/** Root directory of the project. */
const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");

/**
 * Bun build plugin that redirects terminal-specific module imports
 * to browser-compatible web shims.
 */
const webShimsPlugin: BunPlugin = {
  name: "lazybeeper-web-shims",
  setup(build) {
    /* Redirect @opentui/core to the web shim providing TextAttributes. */
    build.onResolve({ filter: /^@opentui\/core$/ }, () => ({
      path: resolve(ROOT, "src/web/opentui-core.ts"),
    }));

    /* Redirect @opentui/react to the web shim providing useKeyboard etc. */
    build.onResolve({ filter: /^@opentui\/react$/ }, () => ({
      path: resolve(ROOT, "src/web/opentui-react.ts"),
    }));

    /*
     * Redirect the JSX runtime imports. The automatic JSX transform
     * imports jsx/jsxs from `@opentui/react/jsx-runtime` (per tsconfig
     * jsxImportSource). Our custom runtime intercepts TUI elements
     * and converts them to HTML.
     */
    build.onResolve({ filter: /^@opentui\/react\/jsx-runtime$/ }, () => ({
      path: resolve(ROOT, "src/web/jsx-runtime.ts"),
    }));
    build.onResolve({ filter: /^@opentui\/react\/jsx-dev-runtime$/ }, () => ({
      path: resolve(ROOT, "src/web/jsx-runtime.ts"),
    }));

    /*
     * Redirect kitty graphics module imports to browser-safe no-op stubs.
     * Matches relative imports containing "kitty" from UI source files.
     */
    build.onResolve({ filter: /kitty/ }, (args) => {
      if (args.importer.includes("/src/ui/") && !args.path.startsWith("@")) {
        return { path: resolve(ROOT, "src/web/kitty-stub.ts") };
      }
      return undefined;
    });

    /*
     * Redirect domain/config-file to the localStorage-backed web version.
     * Matches relative imports from any source file.
     */
    build.onResolve({ filter: /config-file/ }, (args) => {
      if (
        args.importer.includes("/src/") &&
        !args.importer.includes("/src/web/") &&
        !args.path.startsWith("@")
      ) {
        return { path: resolve(ROOT, "src/web/config-file.ts") };
      }
      return undefined;
    });

    /*
     * Redirect smol-toml to an empty module since the web config-file
     * shim uses JSON/localStorage instead of TOML.
     */
    build.onResolve({ filter: /^smol-toml$/ }, () => ({
      path: resolve(ROOT, "src/web/empty-module.ts"),
    }));

    /*
     * Redirect Node.js built-in modules to browser-safe stubs.
     * The mock data module uses node:path and node:url for avatar
     * file paths, which are only meaningful in the terminal build.
     */
    build.onResolve({ filter: /^node:path$/ }, () => ({
      path: resolve(ROOT, "src/web/node-path-stub.ts"),
    }));
    build.onResolve({ filter: /^node:url$/ }, () => ({
      path: resolve(ROOT, "src/web/node-url-stub.ts"),
    }));
    build.onResolve({ filter: /^node:fs$/ }, () => ({
      path: resolve(ROOT, "src/web/empty-module.ts"),
    }));
  },
};

/** Output directory for the web build. */
const outdir = resolve(ROOT, "dist-web");

console.log("Building lazybeeper for the web...");

const result = await Bun.build({
  entrypoints: [resolve(ROOT, "src/web/entry.tsx")],
  outdir,
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "linked",
  plugins: [webShimsPlugin],
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.BEEPER_TOKEN": '""',
    "process.env.BEEPER_URL": '""',
    "process.env.LAZYBEEPER_THEME": '""',
    "process.env.TMUX": '""',
    "process.env.XDG_CONFIG_HOME": '""',
    "process.env.HOME": '""',
  },
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

/* Copy static assets to dist-web. */
const publicDir = resolve(ROOT, "public");
if (existsSync(publicDir)) {
  for (const file of ["index.html", "favicon.ico"]) {
    const src = resolve(publicDir, file);
    if (existsSync(src)) {
      mkdirSync(outdir, { recursive: true });
      copyFileSync(src, resolve(outdir, file));
    }
  }
}

/* Copy mock avatar images so the browser can display them. */
const avatarsDir = resolve(ROOT, "src/data/mock/avatars");
if (existsSync(avatarsDir)) {
  const outAvatars = resolve(outdir, "avatars");
  mkdirSync(outAvatars, { recursive: true });
  for (const file of readdirSync(avatarsDir)) {
    copyFileSync(resolve(avatarsDir, file), resolve(outAvatars, file));
  }
}

console.log(`Web build complete → ${outdir}/`);
for (const output of result.outputs) {
  const size = (output.size / 1024).toFixed(1);
  console.log(`  ${output.path} (${size} KB)`);
}

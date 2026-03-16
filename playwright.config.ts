// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { defineConfig } from "@playwright/test";

/**
 * Playwright configuration for lazybeeper e2e tests.
 * Builds and serves the web version before running tests.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5_000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "bun run scripts/build-web.ts && cd dist-web && bunx serve -l tcp://0.0.0.0:3100",
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});

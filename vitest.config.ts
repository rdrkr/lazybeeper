// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/index.tsx",
        "src/**/index.ts",
        "src/domain/types.ts",
        "src/domain/repository.ts",
        "src/ui/app.tsx",
        "src/ui/theme/types.ts",
        "src/**/*.d.ts",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});

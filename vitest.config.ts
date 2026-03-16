// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      /**
       * Redirect all @opentui/* imports to Node.js-compatible mocks so that
       * Bun-native FFI bindings are never loaded under Vitest's Node runtime.
       */
      "@opentui/core": resolve(__dirname, "tests/mocks/opentui-core.ts"),
      "@opentui/react/jsx-runtime": resolve(
        __dirname,
        "tests/mocks/opentui-react-jsx-runtime.ts",
      ),
      "@opentui/react/jsx-dev-runtime": resolve(
        __dirname,
        "tests/mocks/opentui-react-jsx-dev-runtime.ts",
      ),
      "@opentui/react": resolve(__dirname, "tests/mocks/opentui-react.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["tests/helpers/setup.ts"],
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
        "src/web/**",
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

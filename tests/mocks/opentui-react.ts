// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Mock for `\@opentui/react`.
 * Stubs runtime hooks that depend on OpenTUI's Bun-native renderer so that
 * component modules can be imported under Node.js/Vitest without errors.
 */

export { createRef, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

/**
 * Stub for useKeyboard — no-ops in tests since key events are dispatched manually.
 * @param _handler - Ignored keyboard handler.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useKeyboard(_handler: unknown): void {
  // No-op: keyboard events are not simulated in unit tests.
}

/**
 * Stub for useTerminalDimensions — returns a fixed default size for tests.
 * @returns Fixed terminal dimensions object.
 */
export function useTerminalDimensions(): { width: number; height: number } {
  return { width: 80, height: 24 };
}

/**
 * Stub for createRoot — not used in unit tests (render helper uses react-dom/server).
 * @param _renderer - Ignored renderer argument.
 * @returns A no-op root object.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createRoot(_renderer: unknown): {
  /** No-op render stub. */
  render: (_node: unknown) => void;
  /** No-op unmount stub. */
  unmount: () => void;
} {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render(_node: unknown): void {
      /* no-op */
    },
    unmount(): void {
      /* no-op */
    },
  };
}

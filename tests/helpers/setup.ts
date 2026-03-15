// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Vitest global setup.
 * Patches console.error and console.warn to throw, ensuring that React
 * warnings and other unexpected stderr output cause test failures.
 */

import { afterEach, beforeEach } from "vitest";

/** Captured console.error calls during the current test. */
let errorCalls: unknown[][] = [];

/** Captured console.warn calls during the current test. */
let warnCalls: unknown[][] = [];

/** Original console.error function. */
const originalError = console.error;

/** Original console.warn function. */
const originalWarn = console.warn;

beforeEach(() => {
  errorCalls = [];
  warnCalls = [];
  console.error = (...args: unknown[]): void => {
    errorCalls.push(args);
  };
  console.warn = (...args: unknown[]): void => {
    warnCalls.push(args);
  };
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
  if (errorCalls.length > 0) {
    const messages = errorCalls.map((args) => args.map(String).join(" ")).join("\n");
    throw new Error(`console.error was called during test:\n${messages}`);
  }
  if (warnCalls.length > 0) {
    const messages = warnCalls.map((args) => args.map(String).join(" ")).join("\n");
    throw new Error(`console.warn was called during test:\n${messages}`);
  }
});

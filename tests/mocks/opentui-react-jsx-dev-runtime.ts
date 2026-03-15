// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Mock development JSX runtime for `\@opentui/react`.
 * Used by Vitest in development mode (jsxDEV transform).
 * Strips OpenTUI-specific props from intrinsic elements and passes children
 * as positional args — see the production runtime mock for full documentation.
 */

import { createElement, Fragment } from "react";
import type { ReactNode } from "react";

/** Maps OpenTUI intrinsic element names to HTML equivalents. */
const INTRINSIC_MAP: Record<string, string> = {
  box: "div",
  text: "p",
  span: "span",
  input: "input",
};

/**
 * Creates a React element with children passed as positional arguments.
 * @param type - Resolved element type.
 * @param baseProps - Props without children.
 * @param children - Children to pass as positional args.
 * @returns A React element.
 */
function make(
  type: string | ((...args: unknown[]) => ReactNode),
  baseProps: Record<string, unknown>,
  children: unknown,
): ReactNode {
  if (Array.isArray(children)) {
    return createElement(type as string, baseProps, ...(children as ReactNode[]));
  }
  if (children !== undefined) {
    return createElement(type as string, baseProps, children as ReactNode);
  }
  return createElement(type as string, baseProps);
}

/**
 * Development JSX factory — used by the jsxDEV transform in development mode.
 * Strips non-HTML props from intrinsic elements to prevent React DOM warnings.
 * @param type - Element type (string intrinsic or component function).
 * @param props - Element props.
 * @param key - Optional React key.
 * @returns A React element.
 */
export function jsxDEV(
  type: string | ((...args: unknown[]) => ReactNode),
  props: Record<string, unknown>,
  key?: string,
): ReactNode {
  const { children, ...rest } = props;
  if (typeof type === "string") {
    return make(INTRINSIC_MAP[type] ?? type, { key }, children);
  }
  return make(type, { ...rest, key }, children);
}

export { Fragment };

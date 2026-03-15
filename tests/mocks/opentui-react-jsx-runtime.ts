// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Mock JSX runtime for `\@opentui/react`.
 * Maps OpenTUI intrinsic elements to HTML elements so components can be
 * rendered with react-dom/server.renderToStaticMarkup under Node.js/Vitest.
 *
 * Element mapping:
 *   `box`   → `div`   (layout container)
 *   `text`  → `p`     (text block; `</p>` becomes `\n` during text extraction)
 *   `span`  → `span`  (inline text)
 *   `input` → `input` (text input)
 *
 * All OpenTUI-specific props (fg, bg, attributes, flexDirection, etc.) are
 * stripped from intrinsic elements. Children are always passed as positional
 * arguments to createElement (not as a prop) to prevent spurious key warnings.
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
 * JSX factory — resolves OpenTUI intrinsics to HTML then delegates to React.createElement.
 * Strips non-HTML props from intrinsic elements to prevent React DOM warnings.
 * Children are always passed as positional args to prevent missing-key warnings.
 * @param type - Element type (string intrinsic or component function).
 * @param props - Element props.
 * @param key - Optional React key.
 * @returns A React element.
 */
export function jsx(
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

/**
 * JSX factory for elements with multiple children — same as {@link jsx}.
 * @param type - Element type.
 * @param props - Element props.
 * @param key - Optional React key.
 * @returns A React element.
 */
export const jsxs = jsx;

export { Fragment };

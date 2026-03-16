// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Custom JSX runtime for the web build.
 * Intercepts OpenTUI intrinsic elements (box, text, span, input) and
 * converts them to HTML elements with equivalent CSS styling.
 *
 * This module is aliased in place of the OpenTUI JSX runtime during
 * the web build so that the same component code renders in the browser.
 */

import React from "react";
import { TextAttributes } from "./opentui-core.js";

/** Re-export React.Fragment for JSX. */
export const Fragment = React.Fragment;

/** Props that may appear on TUI box elements. */
interface BoxProps {
  readonly flexDirection?: string;
  readonly width?: number;
  readonly height?: number;
  readonly border?: boolean;
  readonly borderStyle?: string;
  readonly borderColor?: string;
  readonly backgroundColor?: string;
  readonly flexGrow?: number;
  readonly position?: string;
  readonly top?: number;
  readonly left?: number;
  readonly justifyContent?: string;
  readonly alignItems?: string;
  readonly paddingX?: number;
  readonly paddingY?: number;
  readonly gap?: number;
  readonly overflow?: string;
  readonly children?: unknown;
  readonly style?: React.CSSProperties;
  readonly className?: string;
  readonly key?: string;
}

/** Props that may appear on TUI text/span elements. */
interface TextProps {
  readonly fg?: string;
  readonly bg?: string;
  readonly attributes?: number;
  readonly children?: unknown;
  readonly style?: React.CSSProperties;
  readonly className?: string;
  readonly key?: string;
}

/** Props that may appear on TUI input elements. */
interface InputProps {
  readonly focused?: boolean;
  readonly value?: string;
  readonly onInput?: (value: string) => void;
  readonly onChange?: (value: string) => void;
  readonly onSubmit?: (value: string) => void;
  readonly placeholder?: string;
  readonly children?: unknown;
  readonly style?: React.CSSProperties;
  readonly className?: string;
  readonly key?: string;
}

/** Result of converting a TUI element to its HTML equivalent. */
interface ConvertedElement {
  /** The HTML tag name to use. */
  readonly type: string;
  /** The converted HTML-compatible props. */
  readonly props: Record<string, unknown>;
}

/**
 * Converts TUI box props to an HTML div with flexbox CSS.
 * @param props - The TUI box props.
 * @returns Converted type and props for React.createElement.
 */
function convertBox(props: BoxProps): ConvertedElement {
  const {
    flexDirection,
    width,
    height,
    border,
    borderStyle: bStyle,
    borderColor,
    backgroundColor,
    flexGrow,
    position,
    top,
    left,
    justifyContent,
    alignItems,
    paddingX,
    paddingY,
    gap,
    overflow,
    style: existingStyle,
    className,
    children,
    ...rest
  } = props;

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: (flexDirection as React.CSSProperties["flexDirection"]) ?? "column",
    boxSizing: "border-box",
    minWidth: 0,
    minHeight: 0,
    ...existingStyle,
  };

  if (width !== undefined) style.width = `${String(width)}ch`;
  if (height !== undefined) style.height = `calc(${String(height)} * var(--cell-h))`;
  if (border) {
    style.border = `2px solid ${borderColor ?? "var(--tui-border)"}`;
    if (bStyle === "rounded") style.borderRadius = "6px";
  } else {
    style.border = "none";
    style.borderRadius = "0";
  }
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (flexGrow !== undefined) style.flexGrow = flexGrow;
  if (position) style.position = position as React.CSSProperties["position"];
  if (top !== undefined) style.top = `calc(${String(top)} * var(--cell-h))`;
  if (left !== undefined) style.left = `${String(left)}ch`;
  if (justifyContent) style.justifyContent = justifyContent;
  if (alignItems) style.alignItems = alignItems;
  if (paddingX !== undefined) {
    style.paddingLeft = `${String(paddingX)}ch`;
    style.paddingRight = `${String(paddingX)}ch`;
  }
  if (paddingY !== undefined) {
    style.paddingTop = `calc(${String(paddingY)} * var(--cell-h))`;
    style.paddingBottom = `calc(${String(paddingY)} * var(--cell-h))`;
  }
  if (gap !== undefined) style.gap = `${String(gap)}ch`;
  if (overflow) style.overflow = overflow;

  /** Popup backdrops (absolute + semi-transparent bg) cover the full viewport. */
  const isPopupBackdrop =
    position === "absolute" && backgroundColor?.length === 9 && backgroundColor.startsWith("#");
  const baseCn = isPopupBackdrop ? "tui-box tui-popup-backdrop" : "tui-box";
  const cn = className ? `${baseCn} ${className}` : baseCn;

  return {
    type: "div",
    props: { ...rest, style, className: cn, children },
  };
}

/**
 * Applies text attribute flags to a CSS style object.
 * @param style - The CSS style object to mutate.
 * @param attributes - The bitmask attributes value.
 */
function applyTextAttributes(style: React.CSSProperties, attributes: number | undefined): void {
  if (attributes === undefined) return;
  if ((attributes & TextAttributes.BOLD) !== 0) style.fontWeight = "bold";
  if ((attributes & TextAttributes.ITALIC) !== 0) style.fontStyle = "italic";
  if ((attributes & TextAttributes.DIM) !== 0) style.opacity = 0.6;
}

/**
 * Converts TUI text props to an HTML div with text styling.
 * @param props - The TUI text props.
 * @returns Converted type and props for React.createElement.
 */
function convertText(props: TextProps): ConvertedElement {
  const { fg, bg, attributes, style: existingStyle, className, children, ...rest } = props;

  const style: React.CSSProperties = {
    whiteSpace: "pre",
    ...existingStyle,
  };

  if (fg) style.color = fg;
  if (bg) style.backgroundColor = bg;
  applyTextAttributes(style, attributes);

  const cn = className ? `tui-text ${className}` : "tui-text";

  return {
    type: "div",
    props: { ...rest, style, className: cn, children },
  };
}

/**
 * Converts TUI span props to an HTML span with inline styling.
 * @param props - The TUI span props.
 * @returns Converted type and props for React.createElement.
 */
function convertSpan(props: TextProps): ConvertedElement {
  const { fg, bg, attributes, style: existingStyle, className, children, ...rest } = props;

  const style: React.CSSProperties = {
    ...existingStyle,
  };

  if (fg) style.color = fg;
  if (bg) {
    style.backgroundColor = bg;
    style.borderRadius = "2px";
  }
  applyTextAttributes(style, attributes);

  const cn = className ? `tui-span ${className}` : "tui-span";

  return {
    type: "span",
    props: { ...rest, style, className: cn, children },
  };
}

/**
 * Converts TUI input props to an HTML input element.
 * Maps onInput/onSubmit to standard DOM events.
 * @param props - The TUI input props.
 * @returns Converted type and props for React.createElement.
 */
function convertInput(props: InputProps): ConvertedElement {
  const {
    focused,
    value,
    onInput,
    onChange: onChangeProp,
    onSubmit,
    placeholder,
    style: existingStyle,
    className,
    children: _children,
    ...rest
  } = props;

  const style: React.CSSProperties = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "inherit",
    fontFamily: "inherit",
    fontSize: "inherit",
    width: "100%",
    height: "100%",
    padding: "0",
    resize: "none",
    ...existingStyle,
  };

  /**
   * Handles the change event on the textarea.
   * @param e - The React change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const val = e.target.value;
    onInput?.(val);
    onChangeProp?.(val);
  };

  /**
   * Handles keydown events on the textarea.
   * Plain Enter submits; modifier+Enter (shift/alt/ctrl) inserts a newline.
   * @param e - The React keyboard event.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter") {
      if (e.shiftKey || e.altKey || e.ctrlKey) {
        /* Insert a newline explicitly for modifier+Enter. */
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = (value ?? "").substring(0, start) + "\n" + (value ?? "").substring(end);
        onInput?.(newValue);
        /* Move cursor after the inserted newline on next tick. */
        requestAnimationFrame(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = start + 1;
        });
        return;
      }
      if (onSubmit) {
        e.preventDefault();
        e.stopPropagation();
        onSubmit(value ?? "");
      }
    }
  };

  const cn = className ? `tui-input ${className}` : "tui-input";

  /**
   * Ref callback that imperatively focuses the textarea on mount.
   * Unlike autoFocus, this works reliably with React's conditional rendering.
   * @param el - The textarea DOM element, or null on unmount.
   */
  const refCallback = focused
    ? (el: HTMLTextAreaElement | null): void => {
        if (el) {
          el.focus();
        }
      }
    : undefined;

  return {
    type: "textarea",
    props: {
      ...rest,
      value: value ?? "",
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      placeholder,
      ref: refCallback,
      style,
      className: cn,
      rows: 1,
    },
  };
}

/**
 * Converts a TUI element type and props to an HTML equivalent.
 * @param type - The TUI element type string.
 * @param props - The TUI element props.
 * @returns The converted type and props, or null if not a TUI element.
 */
function convertElement(type: string, props: Record<string, unknown>): ConvertedElement | null {
  switch (type) {
    case "box":
      return convertBox(props as unknown as BoxProps);
    case "text":
      return convertText(props as unknown as TextProps);
    case "span":
      return convertSpan(props as unknown as TextProps);
    case "input":
    case "textarea":
      return convertInput(props as unknown as InputProps);
    default:
      return null;
  }
}

/**
 * Resolves a JSX element type and props, converting TUI intrinsics to HTML.
 * @param type - The element type.
 * @param props - The element props.
 * @returns The resolved type and props.
 */
function resolveElement(
  type: React.ElementType,
  props: Record<string, unknown>,
): { type: React.ElementType; props: Record<string, unknown> } {
  if (typeof type === "string") {
    const converted = convertElement(type, props);
    if (converted) {
      return { type: converted.type as React.ElementType, props: converted.props };
    }
  }
  return { type, props };
}

/**
 * JSX factory function for single-child elements.
 * Intercepts TUI intrinsic elements and converts them to HTML.
 * @param type - The element type (string tag or component function).
 * @param props - The element props including children.
 * @param key - Optional React key.
 * @returns A React element.
 */
export function jsx(
  type: React.ElementType,
  props: Record<string, unknown>,
  key?: string | number,
): React.ReactElement {
  const resolved = resolveElement(type, props);
  const { children, ...restProps } = resolved.props;
  if (key !== undefined) restProps.key = key;

  if (children === undefined || children === null) {
    return React.createElement(resolved.type as string, restProps as React.Attributes);
  }
  return React.createElement(
    resolved.type as string,
    restProps as React.Attributes,
    children as React.ReactNode,
  );
}

/**
 * JSX factory function for multi-child elements.
 * Intercepts TUI intrinsic elements and converts them to HTML.
 * @param type - The element type (string tag or component function).
 * @param props - The element props including children array.
 * @param key - Optional React key.
 * @returns A React element.
 */
export function jsxs(
  type: React.ElementType,
  props: Record<string, unknown>,
  key?: string | number,
): React.ReactElement {
  const resolved = resolveElement(type, props);
  const { children, ...restProps } = resolved.props;
  if (key !== undefined) restProps.key = key;

  if (Array.isArray(children)) {
    return React.createElement(
      resolved.type as string,
      restProps as React.Attributes,
      ...(children as React.ReactNode[]),
    );
  }
  if (children === undefined || children === null) {
    return React.createElement(resolved.type as string, restProps as React.Attributes);
  }
  return React.createElement(
    resolved.type as string,
    restProps as React.Attributes,
    children as React.ReactNode,
  );
}

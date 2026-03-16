// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Web shim for `\@opentui/react`.
 * Provides browser-compatible implementations of OpenTUI hooks.
 */

import { useEffect, useState, useCallback } from "react";
import type { KeyInfo } from "../ui/viewmodel/keys.js";

/** Measured character cell dimensions in pixels. */
interface CellSize {
  /** Width of one monospace character in pixels. */
  readonly width: number;
  /** Height of one line (including line-height) in pixels. */
  readonly height: number;
}

/**
 * Measures the pixel size of a single monospace character cell.
 * Creates a temporary DOM element to calculate dimensions.
 * @returns The measured cell dimensions.
 */
function measureCell(): CellSize {
  const el = document.createElement("span");
  el.style.fontFamily = "var(--tui-font, monospace)";
  el.style.fontSize = "var(--tui-font-size, 14px)";
  el.style.lineHeight = "var(--cell-h, 20px)";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.whiteSpace = "pre";
  el.textContent = "X";
  document.body.appendChild(el);
  const rect = el.getBoundingClientRect();
  document.body.removeChild(el);
  return { width: rect.width, height: rect.height };
}

/**
 * Maps a browser KeyboardEvent to an OpenTUI-compatible KeyInfo object.
 * @param e - The browser keyboard event.
 * @returns The mapped key info.
 */
function mapKeyEvent(e: KeyboardEvent): KeyInfo {
  let name: string;

  switch (e.key) {
    case "Enter":
      name = "return";
      break;
    case "Escape":
      name = "escape";
      break;
    case "Tab":
      name = "tab";
      break;
    case "ArrowUp":
      name = "up";
      break;
    case "ArrowDown":
      name = "down";
      break;
    case "ArrowLeft":
      name = "left";
      break;
    case "ArrowRight":
      name = "right";
      break;
    case "Backspace":
      name = "backspace";
      break;
    case "Delete":
      name = "delete";
      break;
    default:
      name = e.key;
      break;
  }

  return {
    name,
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    meta: e.metaKey,
  };
}

/**
 * Hook that provides terminal-like keyboard input handling for the browser.
 * Listens for DOM keydown events and converts them to OpenTUI KeyInfo objects.
 * @param callback - Function called on each key press with mapped key info.
 */
export function useKeyboard(callback: (key: KeyInfo) => void): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      /* Let browser handle OS-level shortcuts. */
      if (e.metaKey && !e.ctrlKey) {
        return;
      }

      /* Prevent default for keys the TUI handles to avoid scrolling etc. */
      const isTuiKey =
        e.key === "Tab" ||
        e.key === "Escape" ||
        (e.key === "/" && !e.shiftKey) ||
        (e.ctrlKey && e.key === "c");

      if (isTuiKey) {
        e.preventDefault();
        /*
         * Stop propagation in capturing phase so the event never reaches
         * a focused <input> element — prevents Tab/Escape from triggering
         * browser input handling instead of TUI navigation.
         */
        e.stopPropagation();
      }

      callback(mapKeyEvent(e));
    };

    window.addEventListener("keydown", handler, true);
    return (): void => {
      window.removeEventListener("keydown", handler, true);
    };
  }, [callback]);
}

/**
 * Computes terminal dimensions from the browser viewport.
 * @returns Character-based columns and rows.
 */
function computeDimensions(): { width: number; height: number } {
  const cell = measureCell();
  if (cell.width === 0 || cell.height === 0) {
    return { width: 120, height: 40 };
  }
  /** Read app padding from the CSS custom property applied as margin on #root > div. */
  const padVal = getComputedStyle(document.documentElement).getPropertyValue("--tui-app-padding");
  const pad = padVal ? parseFloat(padVal) : 0;
  const totalPadH = pad * 2;
  const totalPadV = pad * 2;
  return {
    width: Math.floor((window.innerWidth - totalPadH) / cell.width),
    height: Math.floor((window.innerHeight - totalPadV) / cell.height),
  };
}

/**
 * Hook that returns the terminal dimensions in character cells.
 * Measures the viewport and converts to columns and rows based on
 * the monospace font metrics.
 * @returns An object with `width` (columns) and `height` (rows).
 */
export function useTerminalDimensions(): { width: number; height: number } {
  const [dims, setDims] = useState(computeDimensions);

  const handleResize = useCallback((): void => {
    setDims(computeDimensions());
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return (): void => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return dims;
}

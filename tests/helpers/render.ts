// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Test render helper — dual-mode.
 *
 * **SSR mode (Node.js / default environment):**
 * Uses `react-dom/server.renderToStaticMarkup`. Effects do not run.
 * Used by panel and popup component tests.
 *
 * **Client mode (jsdom environment):**
 * Uses `react-dom/client.createRoot` so `useEffect` runs.
 * Used by hook tests that need `// \@vitest-environment jsdom`.
 *
 * The OpenTUI JSX mock maps:
 *   `<box>`   → `<div>`
 *   `<text>`  → `<p>`   (closing `</p>` becomes `\n` during text extraction)
 *   `<span>`  → `<span>`
 *   `<input>` → `<input>`
 */

import type { ReactNode } from "react";

/** Result of rendering a component in tests, mirroring ink-testing-library's interface. */
export interface RenderResult {
  /** Returns the last rendered frame as a plain character string. */
  lastFrame(): string;
  /** Re-renders with a new node and updates the cached frame. */
  rerender(node: ReactNode): Promise<void>;
  /**
   * Forces one render cycle and updates the cached frame.
   * Useful after timer-driven state changes when using fake timers.
   */
  update(): Promise<void>;
  /** Unmounts the component and releases resources. */
  unmount(): void;
}

/* ------------------------------------------------------------------ */
/*  SSR mode (Node.js)                                                 */
/* ------------------------------------------------------------------ */

/**
 * Converts an HTML string produced by renderToStaticMarkup into a plain-text
 * frame that approximates a terminal screen:
 * - `</p>` (from `<text>` elements) becomes `\n`
 * - All remaining HTML tags are stripped
 * - HTML entities are decoded
 * @param html - Raw HTML from renderToStaticMarkup.
 * @returns Plain text with newline-separated lines.
 */
function htmlToFrame(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)));
}

/**
 * Renders using react-dom/server.renderToStaticMarkup.
 * Effects do not run. Suitable for pure component tests.
 * @param node - The React node to render.
 * @returns A RenderResult with SSR semantics.
 */
async function renderSSR(node: ReactNode): Promise<RenderResult> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  let currentNode = node;
  let cachedFrame = htmlToFrame(renderToStaticMarkup(currentNode));

  return {
    lastFrame(): string {
      return cachedFrame;
    },
    rerender(newNode: ReactNode): Promise<void> {
      currentNode = newNode;
      cachedFrame = htmlToFrame(renderToStaticMarkup(currentNode));
      return Promise.resolve();
    },
    update(): Promise<void> {
      cachedFrame = htmlToFrame(renderToStaticMarkup(currentNode));
      return Promise.resolve();
    },
    unmount(): void {
      // No-op: SSR renders are stateless.
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Client mode (jsdom)                                                */
/* ------------------------------------------------------------------ */

/**
 * Renders using react-dom/client.createRoot so that useEffect hooks run.
 * Requires a jsdom environment (`// \@vitest-environment jsdom`).
 * @param node - The React node to render.
 * @returns A RenderResult with client rendering semantics.
 */
async function renderClient(node: ReactNode): Promise<RenderResult> {
  const { createRoot } = await import("react-dom/client");
  const { act } = await import("react");

  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  act(() => {
    root.render(node);
  });
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;

  return {
    lastFrame(): string {
      return container.textContent as string;
    },
    rerender(newNode: ReactNode): Promise<void> {
      globalThis.IS_REACT_ACT_ENVIRONMENT = true;
      act(() => {
        root.render(newNode);
      });
      globalThis.IS_REACT_ACT_ENVIRONMENT = false;
      return Promise.resolve();
    },
    update(): Promise<void> {
      globalThis.IS_REACT_ACT_ENVIRONMENT = true;
      act(() => {
        // Flush pending state updates and effects.
      });
      globalThis.IS_REACT_ACT_ENVIRONMENT = false;
      return Promise.resolve();
    },
    unmount(): void {
      globalThis.IS_REACT_ACT_ENVIRONMENT = true;
      act(() => {
        root.unmount();
      });
      globalThis.IS_REACT_ACT_ENVIRONMENT = false;
      container.remove();
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Renders a React component for testing.
 * Automatically selects SSR mode (Node.js) or client mode (jsdom) based
 * on whether `document` is available in the current test environment.
 * @param node - The React node to render.
 * @returns A RenderResult with lastFrame, rerender, update, and unmount methods.
 */
export async function render(node: ReactNode): Promise<RenderResult> {
  if (typeof document !== "undefined") {
    return renderClient(node);
  }
  return renderSSR(node);
}

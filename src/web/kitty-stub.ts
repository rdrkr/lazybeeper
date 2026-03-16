// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Web implementation of the Kitty graphics module.
 * Instead of writing terminal escape sequences, renders avatar images
 * as absolutely-positioned DOM elements overlaid on the TUI layout.
 */

/** DOM id for the container holding image overlay elements. */
const OVERLAY_CONTAINER_ID = "kitty-overlay-container";

/**
 * Measures the pixel size of a single monospace character cell.
 * Creates a temporary DOM element to calculate dimensions.
 * @returns The measured width and height in pixels.
 */
function measureCell(): { width: number; height: number } {
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
 * Returns the overlay container element, creating it if necessary.
 * @returns The overlay container DOM element.
 */
function getOverlayContainer(): HTMLElement {
  let container = document.getElementById(OVERLAY_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = OVERLAY_CONTAINER_ID;
    container.style.position = "absolute";
    container.style.width = "0";
    container.style.height = "0";
    container.style.overflow = "visible";
    container.style.pointerEvents = "none";
    container.style.zIndex = "10";
    const root = document.getElementById("root");
    if (root) {
      root.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
  }
  /* Sync position with app margin so overlays align with content. */
  const padVal = getComputedStyle(document.documentElement).getPropertyValue("--tui-app-padding");
  const pad = padVal ? padVal.trim() : "0px";
  container.style.top = pad;
  container.style.left = pad;
  return container;
}

/** @returns Always true in the browser to enable image overlay rendering. */
export function isKittySupported(): boolean {
  return true;
}

/**
 * No-op in the browser.
 * @param _value - Whether to mark Kitty graphics as supported.
 */
export function setKittySupported(_value: boolean): void {
  /* noop */
}

/** @returns Always false in the browser. */
export function isInTmux(): boolean {
  return false;
}

/** @returns Always 0 in the browser. */
export function getTmuxRowOffset(): number {
  return 0;
}

/**
 * No-op in the browser.
 * @param _sequence - The raw escape sequence to wrap.
 * @returns An empty string.
 */
export function tmuxWrap(_sequence: string): string {
  return "";
}

/**
 * No-op in the browser.
 * @returns A resolved promise resolving to true.
 */
export function detectKittyGraphics(): Promise<boolean> {
  return Promise.resolve(true);
}

/**
 * No-op in the browser.
 * @param _pngData - The raw PNG file contents.
 * @param _cols - Number of terminal columns.
 * @param _rows - Number of terminal rows.
 * @returns An empty string.
 */
export function kittyImageSequence(_pngData: Uint8Array, _cols: number, _rows: number): string {
  return "";
}

/**
 * Returns an encoded token containing the image URL and display dimensions.
 * The token is parsed by {@link writeImageOverlays} to create DOM elements.
 * @param filePath - Web-accessible path to the image file.
 * @param cols - Number of character columns the image should span.
 * @param rows - Number of character rows the image should span.
 * @returns An encoded string with path, cols, and rows, or null if no path.
 */
export function loadKittyImage(filePath: string, cols: number, rows: number): string | null {
  if (!filePath) {
    return null;
  }
  return `${filePath}\0${String(cols)}\0${String(rows)}`;
}

/**
 * Removes all image overlay elements from the DOM.
 */
export function deleteAllImages(): void {
  const container = document.getElementById(OVERLAY_CONTAINER_ID);
  if (container) {
    container.innerHTML = "";
  }
}

/**
 * Creates absolutely-positioned img elements for each image overlay.
 * Parses the encoded tokens from {@link loadKittyImage} to determine
 * the image source and display dimensions.
 * @param images - Array of image overlay descriptors with encoded seq tokens.
 */
export function writeImageOverlays(
  images: readonly {
    readonly seq: string;
    readonly row: number;
    readonly col: number;
  }[],
): void {
  if (images.length === 0) {
    return;
  }

  const container = getOverlayContainer();
  const cell = measureCell();

  for (const img of images) {
    const parts = img.seq.split("\0");
    const src = parts[0] ?? "";
    const cols = parseInt(parts[1] ?? "2", 10);

    const el = document.createElement("img");
    el.src = src;
    el.alt = "";
    el.style.position = "absolute";
    el.style.top = `${String(img.row * cell.height)}px`;
    el.style.left = `${String(img.col * cell.width)}px`;
    /** Use cols * cell.width for both dimensions to ensure a perfect square. */
    const size = cols * cell.width;
    el.style.width = `${String(size)}px`;
    el.style.height = `${String(size)}px`;
    el.style.objectFit = "cover";
    el.style.borderRadius = "4px";
    el.style.border = "none";
    el.style.pointerEvents = "none";
    el.draggable = false;
    el.onerror = (): void => {
      el.style.display = "none";
    };
    container.appendChild(el);
  }
}

/** @returns Always true in the browser. */
export function isPaneVisible(): boolean {
  return true;
}

/**
 * No-op in the browser.
 * @param _cb - The callback to invoke on visibility change, or null to unregister.
 */
export function setVisibilityCallback(_cb: ((visible: boolean) => void) | null): void {
  /* noop */
}

/** No-op in the browser. */
export function enableFocusReporting(): void {
  /* noop */
}

/** No-op in the browser. */
export function disableFocusReporting(): void {
  /* noop */
}

/** No-op in the browser. */
export function clearImageCache(): void {
  /* noop */
}

/** No-op in the browser. */
export function resetVisibility(): void {
  /* noop */
}

// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { readFileSync, existsSync, writeSync } from "node:fs";

/**
 * Maximum size of a single base64 chunk in a Kitty graphics payload.
 * The Kitty graphics protocol requires payloads to be chunked into
 * pieces no larger than 4096 bytes of base64.
 */
const CHUNK_SIZE = 4096;

/**
 * Unique image ID used for the Kitty graphics detection query.
 * Chosen to be unlikely to conflict with other applications.
 */
const QUERY_IMAGE_ID = 31337;

/**
 * Timeout in milliseconds for the Kitty graphics detection query.
 * If no response is received within this period, the terminal is
 * assumed to not support the protocol.
 */
const DETECTION_TIMEOUT_MS = 500;

/** Module-level flag indicating whether Kitty graphics are supported. */
let supported = false;

/** Whether the session is running inside tmux. */
const inTmux = !!process.env.TMUX;

/**
 * Additional row offset applied when rendering images inside tmux.
 * DCS passthrough positions in the outer terminal's coordinate space
 * which is shifted by tmux's internal framing.
 */
const TMUX_ROW_OFFSET = 2;

/** Cache of pre-built Kitty graphics escape sequences keyed by "path:cols:rows". */
const imageCache = new Map<string, string>();

/** Whether the tmux pane is currently visible (has focus). */
let paneVisible = true;

/** Callback invoked when tmux pane visibility changes. */
let visibilityCallback: ((visible: boolean) => void) | null = null;

/**
 * Returns whether the terminal supports Kitty graphics protocol.
 * Must be called after {@link detectKittyGraphics} has resolved.
 * @returns True if Kitty graphics are supported.
 */
export function isKittySupported(): boolean {
  return supported;
}

/**
 * Overrides the Kitty graphics support flag.
 * Primarily used for testing.
 * @param value - Whether to mark Kitty graphics as supported.
 */
export function setKittySupported(value: boolean): void {
  supported = value;
}

/**
 * Returns whether the session is running inside tmux.
 * @returns True if the TMUX environment variable is set.
 */
export function isInTmux(): boolean {
  return inTmux;
}

/**
 * Returns the additional row offset needed for image positioning in tmux.
 * DCS passthrough targets the outer terminal's coordinate space which
 * is shifted relative to the pane. Returns 0 when not in tmux.
 * @returns The tmux row offset.
 */
export function getTmuxRowOffset(): number {
  /* v8 ignore next -- tmux branch only reachable when TMUX env var is set */
  return inTmux ? TMUX_ROW_OFFSET : 0;
}

/**
 * Wraps a terminal escape sequence in tmux DCS passthrough so it
 * reaches the outer terminal emulator. Each ESC byte in the original
 * sequence is doubled per the tmux passthrough specification.
 * @param sequence - The raw escape sequence to wrap.
 * @returns The tmux-passthrough-wrapped sequence.
 */
export function tmuxWrap(sequence: string): string {
  const escaped = sequence.replaceAll("\x1b", "\x1b\x1b");
  return `\x1bPtmux;${escaped}\x1b\\`;
}

/**
 * Detects whether the terminal supports the Kitty graphics protocol.
 *
 * Sends a query action (`a=q`) with a minimal 1x1 RGB pixel followed
 * by a DA1 (Primary Device Attributes) request as a sentinel. If the
 * terminal responds with a graphics OK before the DA1 response, Kitty
 * graphics are supported. Updates the module-level {@link supported} flag.
 *
 * When running inside tmux, the query is wrapped in DCS passthrough
 * so it reaches the underlying terminal emulator.
 *
 * Must be called before the renderer takes over the terminal.
 * @returns A promise that resolves to true if Kitty graphics are supported.
 */
export async function detectKittyGraphics(): Promise<boolean> {
  /* Detection only works on interactive TTYs. */
  /* v8 ignore next -- stdout TTY check only reachable when stdin is a TTY */
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return false;
  }

  /* v8 ignore start -- queryTerminal requires a real TTY, covered by manual integration testing */
  const result = await queryTerminal();
  supported = result;
  return result;
  /* v8 ignore stop */
}

/* v8 ignore start -- queryTerminal requires real TTY interaction, covered by manual integration testing */
/**
 * Performs the actual terminal query for Kitty graphics support.
 * Sets stdin to raw mode, sends the query, and parses the response.
 * @returns A promise that resolves to true if the terminal responded with OK.
 */
function queryTerminal(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let buffer = "";

    /**
     * Restores stdin state and removes listeners.
     */
    const cleanup = (): void => {
      process.stdin.setRawMode(wasRaw);
      process.stdin.pause();
      process.stdin.removeListener("data", onData);
      clearTimeout(timer);
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, DETECTION_TIMEOUT_MS);

    /**
     * Handles incoming data from stdin during detection.
     * @param data - The raw data buffer from stdin.
     */
    const onData = (data: Buffer): void => {
      buffer += data.toString();

      /* Graphics OK response means the terminal supports the protocol. */
      if (buffer.includes(`\x1b_Gi=${QUERY_IMAGE_ID};OK\x1b\\`)) {
        cleanup();
        resolve(true);
        return;
      }

      /* DA1 response without a preceding graphics OK means no support. */
      // eslint-disable-next-line no-control-regex -- matching terminal escape sequences requires control characters
      if (/\x1b\[[\d;?]*c/.test(buffer)) {
        cleanup();
        resolve(false);
      }
    };

    process.stdin.on("data", onData);

    /* Send query + DA1 sentinel, wrapped for tmux if needed. */
    const kittyQuery = `\x1b_Gi=${QUERY_IMAGE_ID},s=1,v=1,a=q,t=d,f=24;AAAA\x1b\\`;
    const da1Query = "\x1b[c";

    if (inTmux) {
      process.stdout.write(tmuxWrap(kittyQuery) + tmuxWrap(da1Query));
    } else {
      process.stdout.write(kittyQuery + da1Query);
    }
  });
}
/* v8 ignore stop */

/**
 * Builds a Kitty graphics escape sequence that transmits and displays
 * a PNG image at the current cursor position, scaled to the given
 * cell dimensions.
 *
 * The payload is chunked per the protocol specification (max 4096 bytes
 * per chunk). Uses `q=2` to suppress all terminal responses.
 * @param pngData - The raw PNG file contents.
 * @param cols - Number of terminal columns the image should occupy.
 * @param rows - Number of terminal rows the image should occupy.
 * @returns The complete escape sequence string.
 */
export function kittyImageSequence(pngData: Buffer, cols: number, rows: number): string {
  const b64 = pngData.toString("base64");
  let result = "";

  for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
    const chunk = b64.slice(i, i + CHUNK_SIZE);
    const isLast = i + CHUNK_SIZE >= b64.length;
    const moreFlag = isLast ? 0 : 1;

    if (i === 0) {
      result += `\x1b_Ga=T,f=100,c=${cols},r=${rows},q=2,m=${moreFlag};${chunk}\x1b\\`;
    } else {
      result += `\x1b_Gm=${moreFlag};${chunk}\x1b\\`;
    }
  }

  return result;
}

/**
 * Loads a PNG image from disk and returns its Kitty graphics escape
 * sequence, suitable for embedding in terminal output. Results are
 * cached so repeated calls with the same parameters avoid re-reading
 * and re-encoding the file.
 *
 * Returns null if Kitty graphics are not supported, the file does not
 * exist, or the file cannot be read.
 * @param filePath - Absolute path to a PNG image file.
 * @param cols - Number of terminal columns the image should occupy.
 * @param rows - Number of terminal rows the image should occupy.
 * @returns The escape sequence string, or null if unavailable.
 */
export function loadKittyImage(filePath: string, cols: number, rows: number): string | null {
  if (!supported) {
    return null;
  }

  const cacheKey = `${filePath}:${cols}:${rows}`;
  const cached = imageCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  if (!existsSync(filePath)) {
    return null;
  }

  const data = readFileSync(filePath);
  const sequence = kittyImageSequence(data, cols, rows);
  imageCache.set(cacheKey, sequence);
  return sequence;
}

/**
 * Sends a Kitty graphics delete command to remove all previously
 * displayed images from the terminal. Uses `a=d,d=a` (delete all)
 * with `q=2` to suppress terminal responses.
 *
 * When running inside tmux, the command is wrapped in DCS passthrough
 * so it reaches the underlying terminal emulator.
 *
 * Uses {@link writeSync} to write directly to fd 1, bypassing Bun's
 * stdout buffering which can interleave with the Zig renderer's
 * direct fd writes and corrupt escape sequences.
 */
export function deleteAllImages(): void {
  const deleteCmd = "\x1b_Ga=d,d=a,q=2\x1b\\";
  /* v8 ignore next -- tmux branch only reachable when TMUX env var is set */
  const output = inTmux ? tmuxWrap(deleteCmd) : deleteCmd;
  writeSync(1, output);
}

/**
 * Writes Kitty graphics image overlays to the terminal, bypassing the
 * text rendering pipeline which corrupts APC escape sequences. Uses ANSI
 * cursor save/restore and absolute positioning to place images at the
 * correct terminal coordinates.
 *
 * Uses {@link writeSync} to write directly to fd 1, bypassing Bun's
 * stdout buffering which can interleave with the Zig renderer's
 * direct fd writes and corrupt escape sequences.
 *
 * When running inside tmux, each image sequence is wrapped in DCS
 * passthrough so it reaches the underlying terminal emulator.
 * @param images - Array of image overlay descriptors.
 */
export function writeImageOverlays(
  images: readonly { readonly seq: string; readonly row: number; readonly col: number }[],
): void {
  if (images.length === 0) {
    return;
  }

  let output = "";
  for (const img of images) {
    const positionAndDraw = `\x1b7\x1b[${img.row};${img.col}H${img.seq}\x1b8`;
    /* v8 ignore next -- tmux branch only reachable when TMUX env var is set */
    output += inTmux ? tmuxWrap(positionAndDraw) : positionAndDraw;
  }

  writeSync(1, output);
}

/**
 * Returns whether the tmux pane is currently visible (has focus).
 * Always true when not running in tmux.
 * @returns True if the pane is visible.
 */
export function isPaneVisible(): boolean {
  return paneVisible;
}

/**
 * Registers a callback to be invoked when tmux pane visibility changes.
 * Pass null to unregister.
 * @param cb - The callback to invoke, or null to unregister.
 */
export function setVisibilityCallback(cb: ((visible: boolean) => void) | null): void {
  visibilityCallback = cb;
}

/* v8 ignore start -- focus reporting requires real tmux+TTY, covered by manual integration testing */
/**
 * Handles raw stdin data to detect terminal focus events.
 * Focus-in (`\x1b[I`) and focus-out (`\x1b[O`) sequences are sent
 * by the terminal when focus reporting mode is enabled.
 * @param data - Raw data from stdin.
 */
function handleFocusData(data: Buffer): void {
  const str = data.toString();
  if (str.includes("\x1b[O")) {
    paneVisible = false;
    deleteAllImages();
    visibilityCallback?.(false);
  } else if (str.includes("\x1b[I")) {
    paneVisible = true;
    visibilityCallback?.(true);
  }
}

/**
 * Enables terminal focus reporting so that image overlays can be
 * cleaned up when the tmux pane loses focus. Sends `\x1b[?1004h`
 * to enable focus events and registers a stdin listener.
 *
 * Only active when running in tmux with Kitty graphics support.
 */
export function enableFocusReporting(): void {
  if (!inTmux || !supported) {
    return;
  }
  const enable = "\x1b[?1004h";
  writeSync(1, tmuxWrap(enable));
  process.stdin.on("data", handleFocusData);
}

/**
 * Disables terminal focus reporting and removes the stdin listener.
 * Sends `\x1b[?1004l` to turn off focus events.
 */
export function disableFocusReporting(): void {
  if (!inTmux) {
    return;
  }
  const disable = "\x1b[?1004l";
  writeSync(1, tmuxWrap(disable));
  process.stdin.removeListener("data", handleFocusData);
}
/* v8 ignore stop */

/**
 * Clears the image sequence cache.
 * Primarily used for testing.
 */
export function clearImageCache(): void {
  imageCache.clear();
}

/**
 * Resets the pane visibility flag and callback.
 * Primarily used for testing.
 */
export function resetVisibility(): void {
  paneVisible = true;
  visibilityCallback = null;
}

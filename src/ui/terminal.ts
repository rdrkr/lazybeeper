// Copyright (c) 2026 lazybeeper by Ronen Druker.

import type { Writable } from "node:stream";

/**
 * DEC Private Mode 2026 escape sequences for synchronized output.
 * When enabled, the terminal buffers all writes and only
 * paints the screen when the end marker is received.
 * This eliminates partial-draw flickering, especially in tmux.
 */
const SYNC_START = "\x1b[?2026h";
const SYNC_END = "\x1b[?2026l";

/**
 * Ink's clearTerminal sequence: ESC[2J (clear screen) + ESC[3J
 * (clear scrollback) + ESC[H (cursor home). The clear causes a
 * visible flash even with synchronized output, because the terminal
 * erases the screen before painting the new frame. Replacing it
 * with just cursor-home lets us overwrite in place.
 */
const CLEAR_TERMINAL = "\x1b[2J\x1b[3J\x1b[H";
const CURSOR_HOME = "\x1b[H";

/**
 * Patches a writable stream to:
 * 1. Replace Ink's clearTerminal with cursor-home (overwrite in place).
 * 2. Bracket each write with DEC 2026 synchronized output markers so
 *    the terminal renders each frame atomically.
 *
 * Together these two changes eliminate the clear-then-redraw flash
 * that Ink produces on every render in full-screen mode.
 * @param stream - The writable stream to patch (typically process.stdout).
 * @returns A cleanup function that restores the original write method.
 */
export function enableSynchronizedOutput(stream: Writable): () => void {
  const originalWrite = stream.write.bind(stream) as (
    chunk: string | Uint8Array,
    encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
    callback?: (error?: Error | null) => void,
  ) => boolean;

  stream.write = function synchronizedWrite(
    chunk: string | Uint8Array,
    encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
    callback?: (error?: Error | null) => void,
  ): boolean {
    let data = typeof chunk === "string" ? chunk : chunk.toString();

    /* Replace full terminal clear with cursor-home to overwrite in place. */
    if (data.includes(CLEAR_TERMINAL)) {
      data = data.replaceAll(CLEAR_TERMINAL, CURSOR_HOME);
    }

    const wrapped = SYNC_START + data + SYNC_END;

    if (typeof encodingOrCallback === "function") {
      return originalWrite(wrapped, encodingOrCallback);
    }

    return originalWrite(wrapped, encodingOrCallback, callback);
  } as typeof stream.write;

  /** Restores the original write method. */
  return (): void => {
    stream.write = originalWrite as typeof stream.write;
  };
}

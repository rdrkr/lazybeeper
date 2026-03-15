// Copyright (c) 2026 lazybeeper by Ronen Druker.

import * as path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Mock `writeSync` from `node:fs` so we can verify Kitty graphics output
 * without actually writing to fd 1. All other `node:fs` exports are preserved.
 * Uses `vi.hoisted` because `vi.mock` is hoisted above normal declarations.
 */
const { mockWriteSync } = vi.hoisted(() => ({
  mockWriteSync: vi.fn<(fd: number, data: string) => number>().mockReturnValue(0),
}));

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, writeSync: mockWriteSync };
});
import {
  isKittySupported,
  setKittySupported,
  kittyImageSequence,
  loadKittyImage,
  clearImageCache,
  detectKittyGraphics,
  tmuxWrap,
  isInTmux,
  getTmuxRowOffset,
  writeImageOverlays,
  deleteAllImages,
  isPaneVisible,
  setVisibilityCallback,
  resetVisibility,
} from "../../src/ui/kitty.js";

/** Directory containing mock avatar images for testing. */
const AVATARS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../src/data/mock/avatars",
);

/** Path to the alice PNG test avatar. */
const ALICE_PNG = path.join(AVATARS_DIR, "alice.png");

describe("isKittySupported / setKittySupported", () => {
  beforeEach(() => {
    setKittySupported(false);
  });

  it("defaults to false", () => {
    expect(isKittySupported()).toBe(false);
  });

  it("can be set to true", () => {
    setKittySupported(true);
    expect(isKittySupported()).toBe(true);
  });

  it("can be toggled back to false", () => {
    setKittySupported(true);
    setKittySupported(false);
    expect(isKittySupported()).toBe(false);
  });
});

describe("kittyImageSequence", () => {
  it("generates correct escape sequence for small PNG data", () => {
    const smallPng = Buffer.from("FAKE_PNG_DATA");
    const seq = kittyImageSequence(smallPng, 2, 1);

    /* Starts with Kitty APC graphics opener. */
    expect(seq).toContain("\x1b_G");
    /* Contains transmit+display action. */
    expect(seq).toContain("a=T");
    /* Specifies PNG format. */
    expect(seq).toContain("f=100");
    /* Specifies cell dimensions. */
    expect(seq).toContain("c=2");
    expect(seq).toContain("r=1");
    /* Quiet mode suppresses responses. */
    expect(seq).toContain("q=2");
    /* Ends with APC terminator. */
    expect(seq).toContain("\x1b\\");
    /* Single chunk: m=0 (no more data). */
    expect(seq).toContain("m=0");
  });

  it("includes base64-encoded payload", () => {
    const data = Buffer.from("TEST_DATA");
    const seq = kittyImageSequence(data, 2, 1);
    const expectedB64 = data.toString("base64");
    expect(seq).toContain(expectedB64);
  });

  it("chunks large payloads at 4096 byte boundaries", () => {
    /* Create data that produces > 4096 bytes of base64 (3072 bytes raw = 4096 base64). */
    const largeData = Buffer.alloc(4096, 0x42);
    const seq = kittyImageSequence(largeData, 2, 2);

    /* First chunk should have m=1 (more data). */
    expect(seq).toContain("m=1");
    /* Should have continuation chunks (sequences without a=T). */
    const chunks = seq.split("\x1b\\").filter((s) => s.length > 0);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("handles different cell dimensions", () => {
    const data = Buffer.from("X");
    const seq = kittyImageSequence(data, 4, 3);
    expect(seq).toContain("c=4");
    expect(seq).toContain("r=3");
  });
});

describe("loadKittyImage", () => {
  beforeEach(() => {
    setKittySupported(false);
    clearImageCache();
  });

  it("returns null when Kitty is not supported", () => {
    expect(loadKittyImage(ALICE_PNG, 2, 1)).toBeNull();
  });

  it("returns null for non-existent file", () => {
    setKittySupported(true);
    expect(loadKittyImage("/nonexistent/avatar.png", 2, 1)).toBeNull();
  });

  it("returns escape sequence for valid PNG when supported", () => {
    setKittySupported(true);
    const result = loadKittyImage(ALICE_PNG, 2, 1);
    expect(result).not.toBeNull();
    expect(result).toContain("\x1b_G");
    expect(result).toContain("a=T");
    expect(result).toContain("f=100");
  });

  it("caches results for repeated calls", () => {
    setKittySupported(true);
    const first = loadKittyImage(ALICE_PNG, 2, 1);
    const second = loadKittyImage(ALICE_PNG, 2, 1);
    /* Same reference from cache. */
    expect(first).toBe(second);
  });

  it("uses different cache keys for different dimensions", () => {
    setKittySupported(true);
    const small = loadKittyImage(ALICE_PNG, 2, 1);
    const large = loadKittyImage(ALICE_PNG, 4, 2);
    expect(small).not.toBeNull();
    expect(large).not.toBeNull();
    expect(small).not.toBe(large);
  });

  it("sequence matches directly-built sequence for same file", () => {
    setKittySupported(true);
    const loaded = loadKittyImage(ALICE_PNG, 2, 1);
    const direct = kittyImageSequence(readFileSync(ALICE_PNG), 2, 1);
    expect(loaded).toBe(direct);
  });
});

describe("detectKittyGraphics", () => {
  it("returns false in non-TTY environment", async () => {
    const result = await detectKittyGraphics();
    expect(result).toBe(false);
  });
});

describe("tmuxWrap", () => {
  it("doubles ESC bytes and wraps in DCS passthrough", () => {
    const original = "\x1b_Gtest\x1b\\";
    const wrapped = tmuxWrap(original);
    /* Should start with DCS tmux passthrough. */
    expect(wrapped.startsWith("\x1bPtmux;")).toBe(true);
    /* Should end with ST. */
    expect(wrapped.endsWith("\x1b\\")).toBe(true);
    /* ESC bytes in original should be doubled. */
    expect(wrapped).toContain("\x1b\x1b_G");
    expect(wrapped).toContain("\x1b\x1b\\");
  });

  it("handles string without ESC bytes", () => {
    const result = tmuxWrap("plain");
    expect(result).toBe("\x1bPtmux;plain\x1b\\");
  });
});

describe("isInTmux", () => {
  it("returns a boolean", () => {
    expect(typeof isInTmux()).toBe("boolean");
  });
});

describe("getTmuxRowOffset", () => {
  it("returns a number", () => {
    const offset = getTmuxRowOffset();
    expect(typeof offset).toBe("number");
    /* Outside tmux, offset should be 0. */
    if (!isInTmux()) {
      expect(offset).toBe(0);
    }
  });
});

describe("deleteAllImages", () => {
  afterEach(() => {
    mockWriteSync.mockClear();
  });

  it("writes Kitty delete-all command to stdout", () => {
    deleteAllImages();
    expect(mockWriteSync).toHaveBeenCalledTimes(1);
    const output = mockWriteSync.mock.calls[0][1] as string;
    /* Contains delete action with delete-all specifier. */
    expect(output).toContain("\x1b_G");
    expect(output).toContain("a=d");
    expect(output).toContain("d=a");
    expect(output).toContain("q=2");
    expect(output).toContain("\x1b\\");
  });
});

describe("writeImageOverlays", () => {
  afterEach(() => {
    mockWriteSync.mockClear();
  });

  it("does nothing for empty array", () => {
    writeImageOverlays([]);
    expect(mockWriteSync).not.toHaveBeenCalled();
  });

  it("writes cursor-positioned image sequences to stdout", () => {
    writeImageOverlays([{ seq: "IMG_DATA", row: 5, col: 3 }]);
    expect(mockWriteSync).toHaveBeenCalledTimes(1);
    const output = mockWriteSync.mock.calls[0][1] as string;
    /* Contains cursor save (\x1b7), positioning, image data, cursor restore (\x1b8). */
    expect(output).toContain("\x1b7");
    expect(output).toContain("\x1b[5;3H");
    expect(output).toContain("IMG_DATA");
    expect(output).toContain("\x1b8");
    /* Should not contain delete command. */
    expect(output).not.toContain("a=d");
  });
});

describe("clearImageCache", () => {
  beforeEach(() => {
    setKittySupported(true);
    clearImageCache();
  });

  it("clears cached sequences", () => {
    const first = loadKittyImage(ALICE_PNG, 2, 1);
    clearImageCache();
    const second = loadKittyImage(ALICE_PNG, 2, 1);
    /* Same content but different string instance after cache clear. */
    expect(first).toEqual(second);
  });
});

describe("isPaneVisible", () => {
  afterEach(() => {
    resetVisibility();
  });

  it("returns true by default", () => {
    expect(isPaneVisible()).toBe(true);
  });
});

describe("setVisibilityCallback", () => {
  afterEach(() => {
    resetVisibility();
  });

  it("accepts a callback without error", () => {
    const cb = vi.fn();
    setVisibilityCallback(cb);
    /* No assertion beyond no-throw; callback is invoked by handleFocusData. */
  });

  it("accepts null to unregister", () => {
    setVisibilityCallback(null);
  });
});

describe("resetVisibility", () => {
  it("resets pane visibility to true", () => {
    resetVisibility();
    expect(isPaneVisible()).toBe(true);
  });
});

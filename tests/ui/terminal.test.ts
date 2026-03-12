// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect, vi } from "vitest";
import { PassThrough } from "node:stream";
import { enableSynchronizedOutput } from "../../src/ui/terminal.js";

const SYNC_START = "\x1b[?2026h";
const SYNC_END = "\x1b[?2026l";
const CLEAR_TERMINAL = "\x1b[2J\x1b[3J\x1b[H";
const CURSOR_HOME = "\x1b[H";

describe("enableSynchronizedOutput", () => {
  it("wraps string writes in DEC 2026 markers", () => {
    const stream = new PassThrough();
    const writeSpy = vi.spyOn(stream, "write");

    enableSynchronizedOutput(stream);

    stream.write("hello");

    const written = writeSpy.mock.calls[0]?.[0] as string;
    expect(written).toBe(SYNC_START + "hello" + SYNC_END);
  });

  it("wraps Buffer writes in DEC 2026 markers", () => {
    const stream = new PassThrough();
    const writeSpy = vi.spyOn(stream, "write");

    enableSynchronizedOutput(stream);

    stream.write(Buffer.from("data"));

    const written = writeSpy.mock.calls[0]?.[0] as string;
    expect(written).toBe(SYNC_START + "data" + SYNC_END);
  });

  it("replaces clearTerminal with cursor-home", () => {
    const stream = new PassThrough();
    const writeSpy = vi.spyOn(stream, "write");

    enableSynchronizedOutput(stream);

    stream.write(CLEAR_TERMINAL + "frame content");

    const written = writeSpy.mock.calls[0]?.[0] as string;
    expect(written).toBe(SYNC_START + CURSOR_HOME + "frame content" + SYNC_END);
    expect(written).not.toContain("\x1b[2J");
    expect(written).not.toContain("\x1b[3J");
  });

  it("replaces multiple clearTerminal occurrences", () => {
    const stream = new PassThrough();
    const writeSpy = vi.spyOn(stream, "write");

    enableSynchronizedOutput(stream);

    stream.write(CLEAR_TERMINAL + "a" + CLEAR_TERMINAL + "b");

    const written = writeSpy.mock.calls[0]?.[0] as string;
    expect(written).toBe(SYNC_START + CURSOR_HOME + "a" + CURSOR_HOME + "b" + SYNC_END);
  });

  it("passes encoding argument through", () => {
    const stream = new PassThrough();
    const writeSpy = vi.spyOn(stream, "write");

    enableSynchronizedOutput(stream);

    stream.write("text", "utf8");

    const firstArg = writeSpy.mock.calls[0]?.[0] as string;
    expect(firstArg).toBe(SYNC_START + "text" + SYNC_END);
  });

  it("passes callback argument through", async () => {
    const stream = new PassThrough();
    const callback = vi.fn();

    enableSynchronizedOutput(stream);

    stream.write("data", callback);

    /* The callback may be invoked asynchronously by the stream. */
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(callback).toHaveBeenCalled();
  });

  it("restores original write on cleanup", () => {
    const stream = new PassThrough();
    const originalWrite = stream.write;

    const restore = enableSynchronizedOutput(stream);

    expect(stream.write).not.toBe(originalWrite);

    restore();

    /* After restore, writes should not be wrapped. */
    const writeSpy = vi.spyOn(stream, "write");
    stream.write("plain");

    const written = writeSpy.mock.calls[0]?.[0] as string;
    expect(written).toBe("plain");
  });

  it("handles multiple sequential writes", () => {
    const stream = new PassThrough();
    const writeSpy = vi.spyOn(stream, "write");

    enableSynchronizedOutput(stream);

    stream.write("frame1");
    stream.write("frame2");

    const first = writeSpy.mock.calls[0]?.[0] as string;
    const second = writeSpy.mock.calls[1]?.[0] as string;
    expect(first).toBe(SYNC_START + "frame1" + SYNC_END);
    expect(second).toBe(SYNC_START + "frame2" + SYNC_END);
  });

  it("does not alter writes without clearTerminal", () => {
    const stream = new PassThrough();
    const writeSpy = vi.spyOn(stream, "write");

    enableSynchronizedOutput(stream);

    const normal = "some \x1b[31mcolored\x1b[0m text";
    stream.write(normal);

    const written = writeSpy.mock.calls[0]?.[0] as string;
    expect(written).toBe(SYNC_START + normal + SYNC_END);
  });
});

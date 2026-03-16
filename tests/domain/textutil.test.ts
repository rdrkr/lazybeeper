// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  truncate,
  relativeTime,
  formatTime,
  dateLabel,
  sameDay,
  wrapText,
  chatAvatar,
  buildScrollbar,
} from "../../src/domain/textutil.js";

describe("truncate", () => {
  it("returns empty string when maxLen is 0", () => {
    expect(truncate("hello", 0)).toBe("");
  });

  it("returns empty string when maxLen is negative", () => {
    expect(truncate("hello", -5)).toBe("");
  });

  it("returns the original string when it fits within maxLen", () => {
    expect(truncate("hello", 5)).toBe("hello");
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns ellipsis when maxLen is 1 and string is longer", () => {
    expect(truncate("hello", 1)).toBe("\u2026");
  });

  it("truncates and appends ellipsis when string exceeds maxLen", () => {
    expect(truncate("hello world", 6)).toBe("hello\u2026");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
    expect(truncate("", 0)).toBe("");
  });

  it("handles multi-byte (emoji) characters correctly", () => {
    const emoji = "\u{1F600}\u{1F601}\u{1F602}";
    expect(truncate(emoji, 3)).toBe(emoji);
    expect(truncate(emoji, 2)).toBe("\u{1F600}\u2026");
  });

  it("handles maxLen of exactly string length", () => {
    expect(truncate("abc", 3)).toBe("abc");
  });

  it("handles maxLen of 1 with single character string", () => {
    expect(truncate("a", 1)).toBe("a");
  });
});

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'now' for times less than a minute ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    vi.setSystemTime(now);
    expect(relativeTime(new Date("2026-03-12T11:59:30Z"))).toBe("now");
    expect(relativeTime(now)).toBe("now");
  });

  it("returns '1m ago' for exactly 1 minute", () => {
    vi.setSystemTime(new Date("2026-03-12T12:01:00Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("1m ago");
  });

  it("returns minutes ago for times under an hour", () => {
    vi.setSystemTime(new Date("2026-03-12T12:30:00Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("30m ago");
  });

  it("returns '1h ago' for exactly 1 hour", () => {
    vi.setSystemTime(new Date("2026-03-12T13:00:00Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("1h ago");
  });

  it("returns hours ago for times under a day", () => {
    vi.setSystemTime(new Date("2026-03-12T18:00:00Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("6h ago");
  });

  it("returns 'yesterday' for exactly 1 day ago", () => {
    vi.setSystemTime(new Date("2026-03-13T12:00:00Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("yesterday");
  });

  it("returns days ago for 2-6 days", () => {
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("3d ago");
  });

  it("returns formatted date for 7 or more days ago", () => {
    vi.setSystemTime(new Date("2026-03-20T12:00:00Z"));
    const result = relativeTime(new Date("2026-03-10T12:00:00Z"));
    expect(result).toContain("Mar");
    expect(result).toContain("10");
  });

  it("returns '59m ago' at the boundary before 1 hour", () => {
    vi.setSystemTime(new Date("2026-03-12T12:59:59Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("59m ago");
  });

  it("returns '23h ago' at the boundary before 1 day", () => {
    vi.setSystemTime(new Date("2026-03-13T11:59:59Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("23h ago");
  });

  it("returns '6d ago' at the boundary before 1 week", () => {
    vi.setSystemTime(new Date("2026-03-18T12:00:00Z"));
    expect(relativeTime(new Date("2026-03-12T12:00:00Z"))).toBe("6d ago");
  });
});

describe("formatTime", () => {
  it("formats time with leading zeros", () => {
    expect(formatTime(new Date("2026-01-01T00:00:00"))).toBe("00:00");
  });

  it("formats mid-day time", () => {
    expect(formatTime(new Date("2026-06-15T14:35:00"))).toBe("14:35");
  });

  it("formats single-digit hours and minutes with padding", () => {
    expect(formatTime(new Date("2026-01-01T09:05:00"))).toBe("09:05");
  });

  it("formats end of day", () => {
    expect(formatTime(new Date("2026-01-01T23:59:00"))).toBe("23:59");
  });
});

describe("dateLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Today' for today's date", () => {
    vi.setSystemTime(new Date("2026-03-12T15:00:00"));
    expect(dateLabel(new Date("2026-03-12T08:00:00"))).toBe("Today");
  });

  it("returns 'Yesterday' for yesterday's date", () => {
    vi.setSystemTime(new Date("2026-03-12T15:00:00"));
    expect(dateLabel(new Date("2026-03-11T20:00:00"))).toBe("Yesterday");
  });

  it("returns weekday, month, day for same-year dates", () => {
    vi.setSystemTime(new Date("2026-03-12T15:00:00"));
    const result = dateLabel(new Date("2026-01-05T12:00:00"));
    expect(result).toContain("Jan");
    expect(result).toContain("5");
  });

  it("returns month, day, year for different-year dates", () => {
    vi.setSystemTime(new Date("2026-03-12T15:00:00"));
    const result = dateLabel(new Date("2024-06-15T12:00:00"));
    expect(result).toContain("Jun");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });
});

describe("sameDay", () => {
  it("returns true for same day", () => {
    expect(sameDay(new Date("2026-03-12T00:00:00"), new Date("2026-03-12T23:59:59"))).toBe(true);
  });

  it("returns false for different days", () => {
    expect(sameDay(new Date("2026-03-12T23:59:59"), new Date("2026-03-13T00:00:00"))).toBe(false);
  });

  it("returns false for different months", () => {
    expect(sameDay(new Date("2026-03-12T12:00:00"), new Date("2026-04-12T12:00:00"))).toBe(false);
  });

  it("returns false for different years", () => {
    expect(sameDay(new Date("2025-03-12T12:00:00"), new Date("2026-03-12T12:00:00"))).toBe(false);
  });

  it("returns true for identical dates", () => {
    const date = new Date("2026-03-12T12:00:00");
    expect(sameDay(date, date)).toBe(true);
  });
});

describe("wrapText", () => {
  it("returns original text when maxWidth is 0", () => {
    expect(wrapText("hello world", 0)).toBe("hello world");
  });

  it("returns original text when maxWidth is negative", () => {
    expect(wrapText("hello world", -1)).toBe("hello world");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(wrapText("   ", 10)).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(wrapText("", 10)).toBe("");
  });

  it("does not wrap when text fits within maxWidth", () => {
    expect(wrapText("hello world", 20)).toBe("hello world");
  });

  it("wraps at word boundaries", () => {
    expect(wrapText("hello world foo", 11)).toBe("hello world\nfoo");
  });

  it("wraps long text into multiple lines", () => {
    expect(wrapText("a b c d e f", 3)).toBe("a b\nc d\ne f");
  });

  it("handles a single word", () => {
    expect(wrapText("hello", 3)).toBe("hello");
  });

  it("handles single word that exceeds maxWidth", () => {
    expect(wrapText("superlongword", 5)).toBe("superlongword");
  });

  it("handles multiple spaces between words", () => {
    expect(wrapText("hello    world", 20)).toBe("hello world");
  });

  it("wraps each word onto its own line when maxWidth is very small", () => {
    expect(wrapText("a b c", 1)).toBe("a\nb\nc");
  });

  it("handles text that fits exactly at maxWidth", () => {
    expect(wrapText("hello world", 11)).toBe("hello world");
  });
});

describe("chatAvatar", () => {
  it("returns '?' and default color for empty string", () => {
    const result = chatAvatar("");
    expect(result.initials).toBe("?");
    expect(result.color).toBe("#f38ba8");
  });

  it("returns '?' and default color for whitespace-only string", () => {
    const result = chatAvatar("   ");
    expect(result.initials).toBe("?");
    expect(result.color).toBe("#f38ba8");
  });

  it("returns two-letter initials for a multi-word name", () => {
    const result = chatAvatar("Alice Smith");
    expect(result.initials).toBe("AS");
  });

  it("returns first two letters for a single-word name", () => {
    const result = chatAvatar("alice");
    expect(result.initials).toBe("AL");
  });

  it("returns first two letters uppercase for single word", () => {
    const result = chatAvatar("Bob");
    expect(result.initials).toBe("BO");
  });

  it("uses first and last word for three-word names", () => {
    const result = chatAvatar("Family Group Chat");
    expect(result.initials).toBe("FC");
  });

  it("returns single letter for single-character name", () => {
    const result = chatAvatar("x");
    expect(result.initials).toBe("X");
  });

  it("returns a valid hex color from the palette", () => {
    const result = chatAvatar("Charlie");
    expect(result.color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("returns deterministic results for the same name", () => {
    const first = chatAvatar("Dave");
    const second = chatAvatar("Dave");
    expect(first).toEqual(second);
  });

  it("returns different colors for different names", () => {
    const a = chatAvatar("Alice");
    const b = chatAvatar("Zara");
    expect(a.color !== b.color || a.initials !== b.initials).toBe(true);
  });

  it("handles emoji names with grapheme segmentation", () => {
    const result = chatAvatar("\u{1F600} Smiley");
    expect(result.initials).toBe("\u{1F600}S");
  });

  it("trims leading whitespace before extracting initials", () => {
    const result = chatAvatar("  hello");
    expect(result.initials).toBe("HE");
  });

  it("handles channel-style names", () => {
    const result = chatAvatar("#general");
    expect(result.initials).toBe("#G");
  });
});

describe("buildScrollbar", () => {
  it("returns empty array when content fits", () => {
    expect(buildScrollbar(5, 10, 0)).toEqual([]);
  });

  it("returns empty array when visibleLines is zero", () => {
    expect(buildScrollbar(10, 0, 0)).toEqual([]);
  });

  it("returns scrollbar with thumb at top when offset is 0", () => {
    const bar = buildScrollbar(20, 5, 0);
    expect(bar).toHaveLength(5);
    expect(bar[0]).toBe("\u2588");
  });

  it("returns scrollbar with thumb at bottom when fully scrolled", () => {
    const bar = buildScrollbar(20, 5, 15);
    expect(bar).toHaveLength(5);
    expect(bar[4]).toBe("\u2588");
  });

  it("clamps offset to valid range", () => {
    const bar = buildScrollbar(20, 5, 100);
    expect(bar).toHaveLength(5);
    expect(bar[4]).toBe("\u2588");
  });

  it("clamps negative offset to zero", () => {
    const bar = buildScrollbar(20, 5, -5);
    expect(bar).toHaveLength(5);
    expect(bar[0]).toBe("\u2588");
  });

  it("returns all thumb when total barely exceeds visible", () => {
    const bar = buildScrollbar(6, 5, 0);
    expect(bar).toHaveLength(5);
    // Thumb should be large relative to track
    const thumbCount = bar.filter((c) => c === "\u2588").length;
    expect(thumbCount).toBeGreaterThan(0);
  });
});

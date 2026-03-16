// Copyright (c) 2026 lazybeeper by Ronen Druker.

/** Palette of colors used for deterministic chat avatars. */
const AVATAR_COLORS: readonly string[] = [
  "#f38ba8",
  "#fab387",
  "#f9e2af",
  "#a6e3a1",
  "#94e2d5",
  "#89b4fa",
  "#cba6f7",
  "#f5c2e7",
  "#74c7ec",
  "#b4befe",
];

/**
 * Returns a deterministic two-letter avatar initials and color for a chat name.
 * For names with multiple words, uses the first letter of the first and last word.
 * For single-word names, uses the first two letters.
 * The color is selected from a fixed palette based on a hash of the name.
 * @param name - The chat or user display name.
 * @returns An object with `initials` (up to two characters) and `color` (hex string).
 */
export function chatAvatar(name: string): { initials: string; color: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    /* v8 ignore next -- AVATAR_COLORS[0] is guaranteed defined by the constant array above */
    return { initials: "?", color: AVATAR_COLORS[0] ?? "#89b4fa" };
  }

  const initials = extractInitials(trimmed);

  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) | 0;
  }
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  /* v8 ignore next -- colorIndex is always in bounds due to modulo above */
  const color = AVATAR_COLORS[colorIndex] ?? "#89b4fa";

  return { initials, color };
}

/**
 * Extracts up to two uppercase initials from a name.
 * Multi-word names use the first grapheme of the first and last words.
 * Single-word names use the first two graphemes.
 * @param name - The trimmed display name.
 * @returns Uppercase initials string (1-2 characters).
 */
function extractInitials(name: string): string {
  const words = name.split(/\s+/).filter((word) => word.length > 0);
  const segmenter = new Intl.Segmenter();

  if (words.length >= 2) {
    /* v8 ignore next -- words[0] guaranteed defined by length check */
    const first = firstGrapheme(segmenter, words[0] ?? "");
    /* v8 ignore next -- words[words.length-1] guaranteed defined by length check */
    const last = firstGrapheme(segmenter, words[words.length - 1] ?? "");
    return (first + last).toUpperCase();
  }

  /* Single word: take up to two graphemes. */
  /* v8 ignore next -- words[0] guaranteed defined by filter above */
  const graphemes = Array.from(segmenter.segment(words[0] ?? ""), (seg) => seg.segment);
  if (graphemes.length >= 2) {
    /* v8 ignore next -- graphemes[0] and [1] guaranteed defined by length check */
    return ((graphemes[0] ?? "") + (graphemes[1] ?? "")).toUpperCase();
  }

  /* v8 ignore next -- graphemes[0] guaranteed defined since words[0] has length > 0 */
  return (graphemes[0] ?? "?").toUpperCase();
}

/**
 * Returns the first grapheme of a string.
 * @param segmenter - The Intl.Segmenter instance to use.
 * @param str - The string to extract from.
 * @returns The first grapheme, or "?" if the string is empty.
 */
function firstGrapheme(segmenter: Intl.Segmenter, str: string): string {
  const result = segmenter.segment(str)[Symbol.iterator]().next();
  /* v8 ignore next -- caller guarantees non-empty string */
  return result.done ? "?" : result.value.segment;
}

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;
const DAYS_IN_WEEK = 7;

/**
 * Truncates a string to maxLen characters, appending "..." if truncated.
 * @param str - The input string to truncate.
 * @param maxLen - The maximum allowed length.
 * @returns The truncated string, with an ellipsis appended if it was shortened.
 */
export function truncate(str: string, maxLen: number): string {
  if (maxLen <= 0) {
    return "";
  }

  const segmenter = new Intl.Segmenter();
  const runes = Array.from(segmenter.segment(str), (seg) => seg.segment);
  if (runes.length <= maxLen) {
    return str;
  }

  if (maxLen <= 1) {
    return "\u2026";
  }

  return runes.slice(0, maxLen - 1).join("") + "\u2026";
}

/**
 * Returns a human-readable relative time string.
 * @param when - The timestamp to format relative to now.
 * @returns A human-readable string such as "now", "5m ago", or "yesterday".
 */
export function relativeTime(when: Date): string {
  const elapsed = Date.now() - when.getTime();

  if (elapsed < MS_PER_MINUTE) {
    return "now";
  }

  if (elapsed < MS_PER_HOUR) {
    return formatMinutes(elapsed);
  }

  if (elapsed < MS_PER_DAY) {
    return formatHours(elapsed);
  }

  return formatDays(when, elapsed);
}

/**
 * Returns a relative time string for durations under one hour.
 * @param elapsedMs - The elapsed time in milliseconds.
 * @returns A string like "1m ago" or "15m ago".
 */
function formatMinutes(elapsedMs: number): string {
  const mins = Math.floor(elapsedMs / MS_PER_MINUTE);
  if (mins === 1) {
    return "1m ago";
  }

  return `${mins}m ago`;
}

/**
 * Returns a relative time string for durations under one day.
 * @param elapsedMs - The elapsed time in milliseconds.
 * @returns A string like "1h ago" or "8h ago".
 */
function formatHours(elapsedMs: number): string {
  const hrs = Math.floor(elapsedMs / MS_PER_HOUR);
  if (hrs === 1) {
    return "1h ago";
  }

  return `${hrs}h ago`;
}

/**
 * Returns a relative time string for durations of one day or more.
 * @param when - The original timestamp.
 * @param elapsedMs - The elapsed time in milliseconds.
 * @returns A string like "yesterday", "3d ago", or a formatted date.
 */
function formatDays(when: Date, elapsedMs: number): string {
  const days = Math.floor(elapsedMs / MS_PER_DAY);
  if (days === 1) {
    return "yesterday";
  }

  if (days < DAYS_IN_WEEK) {
    return `${days}d ago`;
  }

  return when.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Returns a short HH:MM formatted time string.
 * @param when - The timestamp to format.
 * @returns A zero-padded time string such as "09:05" or "14:30".
 */
export function formatTime(when: Date): string {
  const hours = when.getHours().toString().padStart(2, "0");
  const minutes = when.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Returns a human-readable date label for grouping messages.
 * @param when - The timestamp to label.
 * @returns A label such as "Today", "Yesterday", or a formatted date string.
 */
export function dateLabel(when: Date): string {
  const now = new Date();

  if (sameDay(when, now)) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (sameDay(when, yesterday)) {
    return "Yesterday";
  }

  if (when.getFullYear() === now.getFullYear()) {
    return when.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return when.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns true if two timestamps fall on the same calendar day.
 * @param first - The first date to compare.
 * @param second - The second date to compare.
 * @returns True if both dates share the same year, month, and day.
 */
export function sameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

/**
 * Wraps a string to fit within maxWidth characters,
 * breaking at word boundaries where possible.
 * @param text - The input text to wrap.
 * @param maxWidth - The maximum line width in characters.
 * @returns The wrapped text with newline separators.
 */
export function wrapText(text: string, maxWidth: number): string {
  if (maxWidth <= 0) {
    return text;
  }

  /* Split on explicit newlines first to preserve paragraph breaks. */
  const paragraphs = text.split("\n");
  const result: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/[ \t]+/).filter((word) => word.length > 0);
    if (words.length === 0) {
      result.push("");
      continue;
    }

    /* v8 ignore next -- words[0] is guaranteed defined by the length check above */
    let current = words[0] ?? "";

    for (const word of words.slice(1)) {
      if (current.length + 1 + word.length <= maxWidth) {
        current += " " + word;
      } else {
        result.push(current);
        current = word;
      }
    }

    result.push(current);
  }

  return result.join("\n");
}

/** Thin track character for the scrollbar. */
const SCROLL_TRACK = "\u2502";

/** Thick thumb character for the scrollbar. */
const SCROLL_THUMB = "\u2588";

/**
 * Builds a vertical scrollbar as an array of single-character strings.
 * Each element is either a track character or a thumb character.
 * Returns an empty array when all content is visible (no scrollbar needed).
 * @param totalLines - Total number of content lines.
 * @param visibleLines - Number of lines visible in the viewport.
 * @param offset - Current scroll offset (0-based).
 * @returns An array of track/thumb characters, one per viewport row.
 */
export function buildScrollbar(totalLines: number, visibleLines: number, offset: number): string[] {
  if (totalLines <= visibleLines || visibleLines <= 0) {
    return [];
  }

  const maxOffset = totalLines - visibleLines;
  const clampedOffset = Math.min(Math.max(offset, 0), maxOffset);

  /** Thumb size: proportional to visible/total, minimum 1 row. */
  const thumbSize = Math.max(Math.round((visibleLines / totalLines) * visibleLines), 1);

  /** Thumb position: proportional to scroll offset within available track. */
  const track = visibleLines - thumbSize;
  const thumbStart = Math.round((clampedOffset / maxOffset) * track);

  const bar: string[] = [];
  for (let i = 0; i < visibleLines; i++) {
    bar.push(i >= thumbStart && i < thumbStart + thumbSize ? SCROLL_THUMB : SCROLL_TRACK);
  }

  return bar;
}

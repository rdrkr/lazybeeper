// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { filterChats } from "../../../src/ui/popup/search-popup.js";
import type { Chat } from "../../../src/domain/types.js";

function makeChat(overrides: Partial<Chat> & { id: string; name: string }): Chat {
  return {
    accountId: "acc-1",
    lastMessage: "",
    lastMessageTime: new Date(),
    unreadCount: 0,
    pinned: false,
    muted: false,
    ...overrides,
  };
}

const testChats: Chat[] = [
  makeChat({ id: "1", name: "Alice", lastMessage: "Hello world" }),
  makeChat({ id: "2", name: "Bob", lastMessage: "Meeting tomorrow" }),
  makeChat({ id: "3", name: "Charlie", lastMessage: "See you later" }),
  makeChat({ id: "4", name: "Alice & Dave", lastMessage: "Project update" }),
];

describe("filterChats", () => {
  it("returns all chats when query is empty", () => {
    expect(filterChats(testChats, "")).toEqual(testChats);
  });

  it("returns all chats when query is only whitespace", () => {
    expect(filterChats(testChats, "   ")).toEqual(testChats);
  });

  it("filters by chat name (case insensitive)", () => {
    const result = filterChats(testChats, "alice");
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("1");
    expect(result[1]!.id).toBe("4");
  });

  it("filters by chat name with uppercase query", () => {
    const result = filterChats(testChats, "BOB");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("2");
  });

  it("filters by last message content", () => {
    const result = filterChats(testChats, "tomorrow");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("2");
  });

  it("matches either name or lastMessage", () => {
    const result = filterChats(testChats, "update");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("4");
  });

  it("returns empty array when nothing matches", () => {
    const result = filterChats(testChats, "zzzzz");
    expect(result).toHaveLength(0);
  });

  it("trims leading and trailing whitespace from query", () => {
    const result = filterChats(testChats, "  bob  ");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("2");
  });

  it("handles empty chat list", () => {
    expect(filterChats([], "alice")).toEqual([]);
  });

  it("handles empty chat list with empty query", () => {
    expect(filterChats([], "")).toEqual([]);
  });

  it("matches partial strings in name", () => {
    const result = filterChats(testChats, "lic");
    expect(result).toHaveLength(2); // Alice and Alice & Dave
  });

  it("matches partial strings in lastMessage", () => {
    const result = filterChats(testChats, "ello");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("1");
  });
});

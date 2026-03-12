// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { SearchPopup } from "../../../src/ui/popup/search-popup.js";
import type { Chat } from "../../../src/domain/types.js";

const mockChats: Chat[] = [
  {
    id: "chat1",
    accountId: "imessage",
    name: "Alice",
    lastMessage: "Want to grab lunch?",
    lastMessageTime: new Date(),
    unreadCount: 2,
    pinned: false,
    muted: false,
  },
  {
    id: "chat2",
    accountId: "imessage",
    name: "Bob",
    lastMessage: "See you tomorrow!",
    lastMessageTime: new Date(),
    unreadCount: 0,
    pinned: false,
    muted: false,
  },
];

describe("SearchPopup", () => {
  it("renders search title", () => {
    const { lastFrame } = render(
      <SearchPopup
        chats={mockChats}
        query=""
        onQueryChange={() => {}}
        filtered={mockChats}
        cursor={0}
        onSelect={() => {}}
        onClose={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("Search Chats");
  });

  it("renders filtered results", () => {
    const { lastFrame } = render(
      <SearchPopup
        chats={mockChats}
        query=""
        onQueryChange={() => {}}
        filtered={mockChats}
        cursor={0}
        onSelect={() => {}}
        onClose={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("Alice");
    expect(lastFrame()).toContain("Bob");
  });

  it("renders unread count for matching chats", () => {
    const { lastFrame } = render(
      <SearchPopup
        chats={mockChats}
        query=""
        onQueryChange={() => {}}
        filtered={mockChats}
        cursor={0}
        onSelect={() => {}}
        onClose={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("(2)");
  });

  it("renders no results message", () => {
    const { lastFrame } = render(
      <SearchPopup
        chats={mockChats}
        query="xyz"
        onQueryChange={() => {}}
        filtered={[]}
        cursor={0}
        onSelect={() => {}}
        onClose={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("No results");
  });

  it("renders cursor indicator", () => {
    const { lastFrame } = render(
      <SearchPopup
        chats={mockChats}
        query=""
        onQueryChange={() => {}}
        filtered={mockChats}
        cursor={0}
        onSelect={() => {}}
        onClose={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("\u25b8");
  });

  it("renders hints text", () => {
    const { lastFrame } = render(
      <SearchPopup
        chats={mockChats}
        query=""
        onQueryChange={() => {}}
        filtered={mockChats}
        cursor={0}
        onSelect={() => {}}
        onClose={() => {}}
        width={80}
        height={24}
      />,
    );
    expect(lastFrame()).toContain("Enter: select");
    expect(lastFrame()).toContain("Esc: close");
  });

  it("shows overflow count for many results", () => {
    const manyChats: Chat[] = Array.from({ length: 15 }, (_, idx) => ({
      id: `chat${idx}`,
      accountId: "test",
      name: `Chat ${idx}`,
      lastMessage: "msg",
      lastMessageTime: new Date(),
      unreadCount: 0,
      pinned: false,
      muted: false,
    }));

    const { lastFrame } = render(
      <SearchPopup
        chats={manyChats}
        query=""
        onQueryChange={() => {}}
        filtered={manyChats}
        cursor={0}
        onSelect={() => {}}
        onClose={() => {}}
        width={80}
        height={30}
      />,
    );
    expect(lastFrame()).toContain("5 more");
  });
});

// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { render } from "../../helpers/render.js";
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
  it("renders search title", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("Search");
  });

  it("renders filtered results", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("Alice");
    expect(rendered.lastFrame()).toContain("Bob");
  });

  it("renders unread count for matching chats", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("(2)");
  });

  it("renders no results message", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("No results");
  });

  it("renders cursor indicator", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("\u25cf");
  });

  it("renders hints text", async () => {
    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("enter select");
  });

  it("shows overflow count for many results", async () => {
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

    const rendered = await render(
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
    expect(rendered.lastFrame()).toContain("5 more");
  });
});

// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { render } from "../../helpers/render.js";
import { ChatsPanel } from "../../../src/ui/panel/chats-panel.js";
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
    lastMessageTime: new Date(Date.now() - 15 * 60_000),
    unreadCount: 0,
    pinned: true,
    muted: false,
  },
  {
    id: "chat3",
    accountId: "imessage",
    name: "Dave",
    lastMessage: "Thanks",
    lastMessageTime: new Date(Date.now() - 180 * 60_000),
    unreadCount: 0,
    pinned: false,
    muted: true,
  },
];

describe("ChatsPanel", () => {
  it("renders the title", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={false} width={30} height={20} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("Chats [2]");
  });

  it("renders chat names with avatar initials", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={false} width={30} height={20} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("A");
    expect(rendered.lastFrame()).toContain("Alice");
    expect(rendered.lastFrame()).toContain("B");
    expect(rendered.lastFrame()).toContain("Bob");
    expect(rendered.lastFrame()).toContain("D");
    expect(rendered.lastFrame()).toContain("Dave");
  });

  it("renders pin and mute indicators", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={false} width={30} height={20} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("\u2605");
    expect(rendered.lastFrame()).toContain("\u223c");
  });

  it("renders unread count", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={false} width={30} height={20} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("(2)");
  });

  it("renders no chats message", async () => {
    const rendered = await render(
      <ChatsPanel chats={[]} focused={false} width={30} height={20} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("No chats");
  });

  it("renders with focus", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={true} width={30} height={20} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("\u25b8");
  });

  it("renders cursor prefix on selected item", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={true} width={30} height={20} cursor={1} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("\u25b8 BO Bob");
  });

  it("renders unfocused selected item without cursor indicator", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={false} width={30} height={20} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("Alice");
    expect(rendered.lastFrame()).not.toContain("\u25b8");
  });

  it("scrolls when cursor is past visible area", async () => {
    const manyChats: Chat[] = Array.from({ length: 10 }, (_, idx) => ({
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
      <ChatsPanel chats={manyChats} focused={true} width={30} height={10} cursor={8} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("Chat 8");
  });

  it("renders scroll indicator for long lists", async () => {
    const manyChats: Chat[] = Array.from({ length: 10 }, (_, idx) => ({
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
      <ChatsPanel chats={manyChats} focused={false} width={30} height={10} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("of");
  });

  it("renders with tiny height", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={false} width={30} height={4} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("Chats [2]");
  });

  it("clamps offset down when cursor moves above current offset", async () => {
    const manyChats: Chat[] = Array.from({ length: 10 }, (_, idx) => ({
      id: `chat${idx}`,
      accountId: "test",
      name: `Chat ${idx}`,
      lastMessage: "msg",
      lastMessageTime: new Date(),
      unreadCount: 0,
      pinned: false,
      muted: false,
    }));

    /* First render with cursor far down to push offset up. */
    const rendered = await render(
      <ChatsPanel chats={manyChats} focused={true} width={30} height={10} cursor={8} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("Chat 8");

    /* Re-render with cursor at 0 so cursor < offset triggers. */
    await rendered.rerender(
      <ChatsPanel chats={manyChats} focused={true} width={30} height={10} cursor={0} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("Chat 0");
  });

  it("handles negative cursor by clamping offset to 0", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={true} width={30} height={20} cursor={-1} top={0} />,
    );
    expect(rendered.lastFrame()).toContain("Chats [2]");
  });

  it("always renders initials in JSX regardless of Kitty support", async () => {
    const rendered = await render(
      <ChatsPanel chats={mockChats} focused={false} width={30} height={20} cursor={0} top={0} />,
    );
    const frame = rendered.lastFrame();
    expect(frame).toContain("AL");
    expect(frame).toContain("Alice");
  });
});

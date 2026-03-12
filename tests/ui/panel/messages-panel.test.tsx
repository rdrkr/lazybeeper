// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { MessagesPanel } from "../../../src/ui/panel/messages-panel.js";
import type { Message } from "../../../src/domain/types.js";

const now = new Date();

const mockMessages: Message[] = [
  {
    id: "m1",
    chatId: "chat1",
    sender: "Alice",
    body: "Hey, how are you?",
    timestamp: new Date(now.getTime() - 10 * 60_000),
    isFromMe: false,
  },
  {
    id: "m2",
    chatId: "chat1",
    sender: "You",
    body: "I'm good, thanks!",
    timestamp: new Date(now.getTime() - 8 * 60_000),
    isFromMe: true,
  },
];

describe("MessagesPanel", () => {
  it("renders the title with chat name", () => {
    const { lastFrame } = render(
      <MessagesPanel
        messages={mockMessages}
        chatName="Alice"
        focused={false}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toContain("Alice - [3]");
  });

  it("renders default title without chat name", () => {
    const { lastFrame } = render(
      <MessagesPanel
        messages={[]}
        chatName=""
        focused={false}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toContain("Messages [3]");
  });

  it("renders no messages placeholder", () => {
    const { lastFrame } = render(
      <MessagesPanel
        messages={[]}
        chatName=""
        focused={false}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toContain("No messages");
  });

  it("renders message content", () => {
    const { lastFrame } = render(
      <MessagesPanel
        messages={mockMessages}
        chatName="Alice"
        focused={false}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toContain("Hey, how are you?");
    expect(lastFrame()).toContain("I'm good, thanks!");
  });

  it("renders sender names", () => {
    const { lastFrame } = render(
      <MessagesPanel
        messages={mockMessages}
        chatName="Alice"
        focused={false}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toContain("Alice");
    expect(lastFrame()).toContain("You");
  });

  it("renders date separator", () => {
    const { lastFrame } = render(
      <MessagesPanel
        messages={mockMessages}
        chatName="Alice"
        focused={false}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    /* The date separator uses horizontal line characters. */
    expect(lastFrame()).toContain("\u2500");
  });

  it("renders with focus", () => {
    const { lastFrame } = render(
      <MessagesPanel
        messages={mockMessages}
        chatName="Alice"
        focused={true}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it("handles scrollOffset", () => {
    const manyMessages: Message[] = Array.from({ length: 30 }, (_, idx) => ({
      id: `m${idx}`,
      chatId: "chat1",
      sender: idx % 2 === 0 ? "Alice" : "You",
      body: `Message ${idx}`,
      timestamp: new Date(now.getTime() - (30 - idx) * 60_000),
      isFromMe: idx % 2 === 1,
    }));

    const { lastFrame } = render(
      <MessagesPanel
        messages={manyMessages}
        chatName="Alice"
        focused={false}
        width={60}
        height={10}
        scrollOffset={5}
      />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it("handles small dimensions", () => {
    const { lastFrame } = render(
      <MessagesPanel
        messages={mockMessages}
        chatName="Alice"
        focused={false}
        width={5}
        height={5}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toBeDefined();
  });

  it("skips null entries in messages array", () => {
    /* Create a sparse array with a null-ish gap to exercise the null guard. */
    const sparseMessages: Message[] = [
      {
        id: "m1",
        chatId: "chat1",
        sender: "Alice",
        body: "First message",
        timestamp: now,
        isFromMe: false,
      },
    ];
    /* Force a hole by setting length beyond actual entries. */
    sparseMessages.length = 3;
    sparseMessages[2] = {
      id: "m3",
      chatId: "chat1",
      sender: "Bob",
      body: "Third message",
      timestamp: now,
      isFromMe: false,
    };

    const { lastFrame } = render(
      <MessagesPanel
        messages={sparseMessages}
        chatName="Test"
        focused={false}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toContain("First message");
    expect(lastFrame()).toContain("Third message");
  });

  it("renders messages across different days", () => {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const crossDayMessages: Message[] = [
      {
        id: "m1",
        chatId: "chat1",
        sender: "Alice",
        body: "Hello from yesterday",
        timestamp: yesterday,
        isFromMe: false,
      },
      {
        id: "m2",
        chatId: "chat1",
        sender: "You",
        body: "Hello from today",
        timestamp: now,
        isFromMe: true,
      },
    ];

    const { lastFrame } = render(
      <MessagesPanel
        messages={crossDayMessages}
        chatName="Alice"
        focused={false}
        width={60}
        height={20}
        scrollOffset={0}
      />,
    );
    expect(lastFrame()).toContain("Today");
  });
});

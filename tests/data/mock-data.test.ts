// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { getAccounts, getChats, getMessages } from "../../src/data/mock/data.js";

describe("getAccounts", () => {
  it("returns four hardcoded accounts", () => {
    const accounts = getAccounts();
    expect(accounts).toHaveLength(4);
  });

  it("returns accounts with correct ids", () => {
    const accounts = getAccounts();
    const ids = accounts.map((a) => a.id);
    expect(ids).toEqual(["imessage", "slack", "signal", "whatsapp"]);
  });

  it("returns accounts with correct connected status", () => {
    const accounts = getAccounts();
    const connectedMap = Object.fromEntries(accounts.map((a) => [a.id, a.connected]));
    expect(connectedMap).toEqual({
      imessage: true,
      slack: true,
      signal: false,
      whatsapp: true,
    });
  });

  it("returns accounts with protocol matching id", () => {
    const accounts = getAccounts();
    for (const account of accounts) {
      expect(account.protocol).toBe(account.id);
    }
  });

  it("returns accounts with non-empty names", () => {
    const accounts = getAccounts();
    for (const account of accounts) {
      expect(account.name.length).toBeGreaterThan(0);
    }
  });
});

describe("getChats", () => {
  it("returns 4 chats for imessage", () => {
    const chats = getChats("imessage");
    expect(chats).toHaveLength(4);
  });

  it("returns 3 chats for slack", () => {
    const chats = getChats("slack");
    expect(chats).toHaveLength(3);
  });

  it("returns 1 chat for signal", () => {
    const chats = getChats("signal");
    expect(chats).toHaveLength(1);
  });

  it("returns 2 chats for whatsapp", () => {
    const chats = getChats("whatsapp");
    expect(chats).toHaveLength(2);
  });

  it("returns empty array for unknown account", () => {
    const chats = getChats("nonexistent");
    expect(chats).toEqual([]);
  });

  it("sets correct accountId on each chat", () => {
    for (const accountId of ["imessage", "slack", "signal", "whatsapp"]) {
      const chats = getChats(accountId);
      for (const chat of chats) {
        expect(chat.accountId).toBe(accountId);
      }
    }
  });

  it("includes a pinned chat in imessage (Family Group)", () => {
    const chats = getChats("imessage");
    const pinned = chats.filter((c) => c.pinned);
    expect(pinned).toHaveLength(1);
    expect(pinned[0].name).toBe("Family Group");
  });

  it("includes a muted chat in imessage (Dave)", () => {
    const chats = getChats("imessage");
    const muted = chats.filter((c) => c.muted);
    expect(muted).toHaveLength(1);
    expect(muted[0].name).toBe("Dave");
  });

  it("returns chats with lastMessageTime as Date instances", () => {
    const chats = getChats("imessage");
    for (const chat of chats) {
      expect(chat.lastMessageTime).toBeInstanceOf(Date);
    }
  });

  it("returns chats with non-negative unreadCount", () => {
    const chats = getChats("slack");
    for (const chat of chats) {
      expect(chat.unreadCount).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("getMessages", () => {
  it("returns 5 messages for chat1", () => {
    const messages = getMessages("chat1");
    expect(messages).toHaveLength(5);
  });

  it("returns 3 messages for chat2", () => {
    const messages = getMessages("chat2");
    expect(messages).toHaveLength(3);
  });

  it("returns 2 messages for chat5", () => {
    const messages = getMessages("chat5");
    expect(messages).toHaveLength(2);
  });

  it("returns default 2 messages for unknown chatId", () => {
    const messages = getMessages("unknown-chat");
    expect(messages).toHaveLength(2);
  });

  it("sets chatId on default messages to the requested chatId", () => {
    const messages = getMessages("some-random-id");
    for (const msg of messages) {
      expect(msg.chatId).toBe("some-random-id");
    }
  });

  it("default messages have correct ids", () => {
    const messages = getMessages("nonexistent");
    expect(messages[0].id).toBe("md1");
    expect(messages[1].id).toBe("md2");
  });

  it("default messages have correct senders", () => {
    const messages = getMessages("nonexistent");
    expect(messages[0].sender).toBe("Someone");
    expect(messages[0].isFromMe).toBe(false);
    expect(messages[1].sender).toBe("You");
    expect(messages[1].isFromMe).toBe(true);
  });

  it("returns messages with correct chatId", () => {
    const messages = getMessages("chat1");
    for (const msg of messages) {
      expect(msg.chatId).toBe("chat1");
    }
  });

  it("returns messages with timestamps as Date instances", () => {
    const messages = getMessages("chat1");
    for (const msg of messages) {
      expect(msg.timestamp).toBeInstanceOf(Date);
    }
  });

  it("contains both sent and received messages in chat1", () => {
    const messages = getMessages("chat1");
    const fromMe = messages.filter((m) => m.isFromMe);
    const fromOther = messages.filter((m) => !m.isFromMe);
    expect(fromMe.length).toBeGreaterThan(0);
    expect(fromOther.length).toBeGreaterThan(0);
  });

  it("messages from me have sender 'You'", () => {
    const messages = getMessages("chat1");
    for (const msg of messages) {
      if (msg.isFromMe) {
        expect(msg.sender).toBe("You");
      }
    }
  });
});

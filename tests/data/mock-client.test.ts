// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { MockClient } from "../../src/data/mock/client.js";
import { ALL_ACCOUNTS_ID } from "../../src/domain/types.js";

describe("MockClient", () => {
  it("implements Repository interface", () => {
    const client = new MockClient();
    expect(typeof client.fetchAccounts).toBe("function");
    expect(typeof client.fetchChats).toBe("function");
    expect(typeof client.fetchMessages).toBe("function");
    expect(typeof client.sendMessage).toBe("function");
    expect(typeof client.archiveChat).toBe("function");
    expect(typeof client.useMock).toBe("function");
  });

  describe("useMock", () => {
    it("always returns true", () => {
      const client = new MockClient();
      expect(client.useMock()).toBe(true);
    });
  });

  describe("fetchAccounts", () => {
    it("returns mock accounts", async () => {
      const client = new MockClient();
      const accounts = await client.fetchAccounts();
      expect(accounts).toHaveLength(4);
      expect(accounts[0].id).toBe("imessage");
    });

    it("returns a promise", () => {
      const client = new MockClient();
      const result = client.fetchAccounts();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("fetchChats", () => {
    it("returns mock chats for a known account", async () => {
      const client = new MockClient();
      const chats = await client.fetchChats("slack");
      expect(chats).toHaveLength(3);
    });

    it("returns empty array for unknown account", async () => {
      const client = new MockClient();
      const chats = await client.fetchChats("unknown");
      expect(chats).toEqual([]);
    });

    it("returns chats from all accounts when using ALL_ACCOUNTS_ID", async () => {
      const client = new MockClient();
      const allChats = await client.fetchChats(ALL_ACCOUNTS_ID);
      const accounts = await client.fetchAccounts();
      let expectedTotal = 0;
      for (const acct of accounts) {
        const chats = await client.fetchChats(acct.id);
        expectedTotal += chats.length;
      }
      expect(allChats).toHaveLength(expectedTotal);
    });
  });

  describe("fetchMessages", () => {
    it("returns mock messages for a known chat", async () => {
      const client = new MockClient();
      const messages = await client.fetchMessages("chat1");
      expect(messages).toHaveLength(5);
    });

    it("returns default messages for an unknown chat", async () => {
      const client = new MockClient();
      const messages = await client.fetchMessages("unknown-chat");
      expect(messages).toHaveLength(2);
    });

    it("includes extra messages after sendMessage", async () => {
      const client = new MockClient();
      const before = await client.fetchMessages("chat1");
      await client.sendMessage("chat1", "Hello!");
      const after = await client.fetchMessages("chat1");
      expect(after).toHaveLength(before.length + 1);
    });

    it("appended message has correct properties", async () => {
      const client = new MockClient();
      await client.sendMessage("chat2", "Test message");
      const messages = await client.fetchMessages("chat2");
      const last = messages[messages.length - 1];
      expect(last.chatId).toBe("chat2");
      expect(last.sender).toBe("You");
      expect(last.body).toBe("Test message");
      expect(last.isFromMe).toBe(true);
      expect(last.timestamp).toBeInstanceOf(Date);
      expect(last.id).toMatch(/^local-/);
    });
  });

  describe("sendMessage", () => {
    it("stores messages separately per chat", async () => {
      const client = new MockClient();
      await client.sendMessage("chat1", "msg1");
      await client.sendMessage("chat2", "msg2");

      const msgs1 = await client.fetchMessages("chat1");
      const msgs2 = await client.fetchMessages("chat2");

      const last1 = msgs1[msgs1.length - 1];
      const last2 = msgs2[msgs2.length - 1];
      expect(last1.body).toBe("msg1");
      expect(last2.body).toBe("msg2");
    });

    it("appends multiple messages to same chat", async () => {
      const client = new MockClient();
      const baseCount = (await client.fetchMessages("chat5")).length;
      await client.sendMessage("chat5", "first");
      await client.sendMessage("chat5", "second");
      const messages = await client.fetchMessages("chat5");
      expect(messages).toHaveLength(baseCount + 2);
      expect(messages[messages.length - 2].body).toBe("first");
      expect(messages[messages.length - 1].body).toBe("second");
    });

    it("returns a resolved promise", async () => {
      const client = new MockClient();
      const result = client.sendMessage("chat1", "test");
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe("archiveChat", () => {
    it("is a no-op that returns a resolved promise", async () => {
      const client = new MockClient();
      const result = client.archiveChat("chat1", true);
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });

    it("does not throw for any arguments", async () => {
      const client = new MockClient();
      await expect(client.archiveChat("chat1", true)).resolves.toBeUndefined();
      await expect(client.archiveChat("chat1", false)).resolves.toBeUndefined();
      await expect(client.archiveChat("nonexistent", true)).resolves.toBeUndefined();
    });
  });
});

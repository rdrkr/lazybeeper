// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient } from "../../src/data/client.js";
import type { Config } from "../../src/domain/config.js";

/** Helper to create a mock config with an empty token (mock mode). */
function mockConfig(): Config {
  return { token: "", baseUrl: "http://localhost:23373" };
}

/** Helper to create a live config with a real token. */
function liveConfig(): Config {
  return { token: "test-token-123", baseUrl: "http://localhost:9999" };
}

/**
 * Creates a mock fetch Response.
 * @param data
 * @param status
 * @param statusText
 */
function mockResponse(data: unknown, status = 200, statusText = "OK"): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    redirected: false,
    type: "basic",
    url: "",
    clone: () => mockResponse(data, status, statusText),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(JSON.stringify(data)),
    bytes: () => Promise.resolve(new Uint8Array()),
  } as Response;
}

describe("ApiClient - mock mode", () => {
  it("useMock returns true when token is empty", () => {
    const client = new ApiClient(mockConfig());
    expect(client.useMock()).toBe(true);
  });

  it("fetchAccounts returns mock data", async () => {
    const client = new ApiClient(mockConfig());
    const accounts = await client.fetchAccounts();
    expect(accounts).toHaveLength(4);
    expect(accounts[0].id).toBe("imessage");
  });

  it("fetchChats returns mock data", async () => {
    const client = new ApiClient(mockConfig());
    const chats = await client.fetchChats("slack");
    expect(chats).toHaveLength(3);
  });

  it("fetchMessages returns mock data", async () => {
    const client = new ApiClient(mockConfig());
    const messages = await client.fetchMessages("chat1");
    expect(messages).toHaveLength(5);
  });

  it("sendMessage appends to mock storage", async () => {
    const client = new ApiClient(mockConfig());
    const before = await client.fetchMessages("chat1");
    await client.sendMessage("chat1", "Hello mock!");
    const after = await client.fetchMessages("chat1");
    expect(after).toHaveLength(before.length + 1);
    expect(after[after.length - 1].body).toBe("Hello mock!");
  });

  it("archiveChat is a no-op in mock mode", async () => {
    const client = new ApiClient(mockConfig());
    await expect(client.archiveChat("chat1", true)).resolves.toBeUndefined();
  });
});

describe("ApiClient - live mode", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("useMock returns false when token is provided", () => {
    const client = new ApiClient(liveConfig());
    expect(client.useMock()).toBe(false);
  });

  describe("fetchAccounts", () => {
    it("fetches accounts from API and maps them to domain type", async () => {
      const apiAccounts = [
        { account_id: "acc1", user: { full_name: "Alice", username: "alice" } },
        { account_id: "acc2", user: { full_name: "Bob" } },
      ];
      fetchMock.mockResolvedValueOnce(mockResponse(apiAccounts));

      const client = new ApiClient(liveConfig());
      const accounts = await client.fetchAccounts();

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:9999/accounts",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          }),
        }),
      );

      expect(accounts).toHaveLength(2);
      expect(accounts[0]).toEqual({
        id: "acc1",
        name: "Alice",
        protocol: "acc1",
        connected: true,
      });
      expect(accounts[1]).toEqual({
        id: "acc2",
        name: "Bob",
        protocol: "acc2",
        connected: true,
      });
    });

    it("falls back to username when full_name is missing", async () => {
      const apiAccounts = [{ account_id: "acc1", user: { username: "user1" } }];
      fetchMock.mockResolvedValueOnce(mockResponse(apiAccounts));

      const client = new ApiClient(liveConfig());
      const accounts = await client.fetchAccounts();

      expect(accounts[0].name).toBe("user1");
    });

    it("falls back to empty string full_name uses username", async () => {
      const apiAccounts = [{ account_id: "acc1", user: { full_name: "", username: "fallback" } }];
      fetchMock.mockResolvedValueOnce(mockResponse(apiAccounts));

      const client = new ApiClient(liveConfig());
      const accounts = await client.fetchAccounts();

      expect(accounts[0].name).toBe("fallback");
    });

    it("falls back to account_id when both full_name and username are missing", async () => {
      const apiAccounts = [{ account_id: "acc-id-only", user: {} }];
      fetchMock.mockResolvedValueOnce(mockResponse(apiAccounts));

      const client = new ApiClient(liveConfig());
      const accounts = await client.fetchAccounts();

      expect(accounts[0].name).toBe("acc-id-only");
    });

    it("falls back to account_id when both full_name and username are empty strings", async () => {
      const apiAccounts = [{ account_id: "acc-fallback", user: { full_name: "", username: "" } }];
      fetchMock.mockResolvedValueOnce(mockResponse(apiAccounts));

      const client = new ApiClient(liveConfig());
      const accounts = await client.fetchAccounts();

      expect(accounts[0].name).toBe("acc-fallback");
    });

    it("throws on API error", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(null, 500, "Internal Server Error"));

      const client = new ApiClient(liveConfig());
      await expect(client.fetchAccounts()).rejects.toThrow("API error: 500 Internal Server Error");
    });
  });

  describe("fetchChats", () => {
    it("fetches chats with account_id query param", async () => {
      const apiResponse = {
        items: [
          {
            id: "c1",
            account_id: "acc1",
            title: "Chat One",
            preview: { text: "Hello" },
            last_activity: "2025-01-01T00:00:00Z",
            unread_count: 3,
            is_pinned: true,
            is_muted: false,
          },
        ],
      };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      const chats = await client.fetchChats("acc1");

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:9999/chats?account_ids=acc1",
        expect.anything(),
      );

      expect(chats).toHaveLength(1);
      expect(chats[0]).toEqual({
        id: "c1",
        accountId: "acc1",
        name: "Chat One",
        lastMessage: "Hello",
        lastMessageTime: new Date("2025-01-01T00:00:00Z"),
        unreadCount: 3,
        pinned: true,
        muted: false,
      });
    });

    it("fetches chats without query param when accountId is empty", async () => {
      const apiResponse = { items: [] };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      await client.fetchChats("");

      expect(fetchMock).toHaveBeenCalledWith("http://localhost:9999/chats", expect.anything());
    });

    it("returns empty array when items is null/undefined", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({}));

      const client = new ApiClient(liveConfig());
      const chats = await client.fetchChats("acc1");

      expect(chats).toEqual([]);
    });
  });

  describe("fetchMessages", () => {
    it("fetches messages and returns them reversed", async () => {
      const apiResponse = {
        items: [
          {
            id: "m1",
            chat_id: "c1",
            sender_name: "Alice",
            is_sender: false,
            text: "First",
            timestamp: "2025-01-01T00:00:00Z",
          },
          {
            id: "m2",
            chat_id: "c1",
            sender_name: "Bob",
            is_sender: false,
            text: "Second",
            timestamp: "2025-01-01T00:01:00Z",
          },
        ],
      };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      const messages = await client.fetchMessages("c1");

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:9999/chats/c1/messages",
        expect.anything(),
      );

      expect(messages).toHaveLength(2);
      // Reversed order
      expect(messages[0].id).toBe("m2");
      expect(messages[1].id).toBe("m1");
    });

    it("sets sender to 'You' when is_sender is true", async () => {
      const apiResponse = {
        items: [
          {
            id: "m1",
            chat_id: "c1",
            sender_name: "Ignored",
            is_sender: true,
            text: "My message",
            timestamp: "2025-01-01T00:00:00Z",
          },
        ],
      };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      const messages = await client.fetchMessages("c1");

      expect(messages[0].sender).toBe("You");
      expect(messages[0].isFromMe).toBe(true);
    });

    it("falls back to sender_id when sender_name is missing", async () => {
      const apiResponse = {
        items: [
          {
            id: "m1",
            chat_id: "c1",
            sender_id: "user-123",
            is_sender: false,
            text: "Hello",
            timestamp: "2025-01-01T00:00:00Z",
          },
        ],
      };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      const messages = await client.fetchMessages("c1");

      expect(messages[0].sender).toBe("user-123");
    });

    it("uses empty string sender when both sender_name and sender_id missing", async () => {
      const apiResponse = {
        items: [
          {
            id: "m1",
            chat_id: "c1",
            is_sender: false,
            text: "Hello",
            timestamp: "2025-01-01T00:00:00Z",
          },
        ],
      };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      const messages = await client.fetchMessages("c1");

      expect(messages[0].sender).toBe("");
    });

    it("shows [Attachment] when text is missing but attachments exist", async () => {
      const apiResponse = {
        items: [
          {
            id: "m1",
            chat_id: "c1",
            sender_name: "Alice",
            is_sender: false,
            attachments: [{ type: "image" }],
            timestamp: "2025-01-01T00:00:00Z",
          },
        ],
      };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      const messages = await client.fetchMessages("c1");

      expect(messages[0].body).toBe("[Attachment]");
    });

    it("shows empty body when no text and no attachments", async () => {
      const apiResponse = {
        items: [
          {
            id: "m1",
            chat_id: "c1",
            sender_name: "Alice",
            is_sender: false,
            timestamp: "2025-01-01T00:00:00Z",
          },
        ],
      };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      const messages = await client.fetchMessages("c1");

      expect(messages[0].body).toBe("");
    });

    it("shows empty body when no text and empty attachments array", async () => {
      const apiResponse = {
        items: [
          {
            id: "m1",
            chat_id: "c1",
            sender_name: "Alice",
            is_sender: false,
            attachments: [],
            timestamp: "2025-01-01T00:00:00Z",
          },
        ],
      };
      fetchMock.mockResolvedValueOnce(mockResponse(apiResponse));

      const client = new ApiClient(liveConfig());
      const messages = await client.fetchMessages("c1");

      expect(messages[0].body).toBe("");
    });

    it("returns empty array when items is null/undefined", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({}));

      const client = new ApiClient(liveConfig());
      const messages = await client.fetchMessages("c1");

      expect(messages).toEqual([]);
    });
  });

  describe("sendMessage", () => {
    it("sends POST request with message body", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({}));

      const client = new ApiClient(liveConfig());
      await client.sendMessage("c1", "Hello world");

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:9999/chats/c1/messages",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ text: "Hello world" }),
          headers: expect.objectContaining({
            Authorization: "Bearer test-token-123",
          }),
        }),
      );
    });

    it("throws on API error", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(null, 403, "Forbidden"));

      const client = new ApiClient(liveConfig());
      await expect(client.sendMessage("c1", "test")).rejects.toThrow("API error: 403 Forbidden");
    });
  });

  describe("archiveChat", () => {
    it("sends POST request with archive flag true", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({}));

      const client = new ApiClient(liveConfig());
      await client.archiveChat("c1", true);

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:9999/chats/c1/archive",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ archived: true }),
        }),
      );
    });

    it("sends POST request with archive flag false", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({}));

      const client = new ApiClient(liveConfig());
      await client.archiveChat("c1", false);

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:9999/chats/c1/archive",
        expect.objectContaining({
          body: JSON.stringify({ archived: false }),
        }),
      );
    });

    it("throws on API error", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(null, 404, "Not Found"));

      const client = new ApiClient(liveConfig());
      await expect(client.archiveChat("c1", true)).rejects.toThrow("API error: 404 Not Found");
    });
  });

  describe("request headers", () => {
    it("includes Authorization and Content-Type headers", async () => {
      fetchMock.mockResolvedValueOnce(mockResponse([]));

      const client = new ApiClient(liveConfig());
      await client.fetchAccounts();

      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[1].headers).toEqual(
        expect.objectContaining({
          Authorization: "Bearer test-token-123",
          "Content-Type": "application/json",
        }),
      );
    });
  });
});

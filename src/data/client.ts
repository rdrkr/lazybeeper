// Copyright (c) 2026 lazybeeper by Ronen Druker.

import type { Config } from "../domain/config.js";
import type { Repository } from "../domain/repository.js";
import type { Account, Chat, Message } from "../domain/types.js";
import { ALL_ACCOUNTS_ID } from "../domain/types.js";
import { MockClient } from "./mock/client.js";

/**
 * ApiClient wraps the Beeper Desktop API for use by the TUI.
 * If no token is configured, falls back to mock data.
 */
export class ApiClient implements Repository {
  private readonly config: Config;
  private readonly isMock: boolean;
  private readonly mockClient: MockClient | null;

  constructor(config: Config) {
    this.config = config;
    this.isMock = config.token === "";
    this.mockClient = this.isMock ? new MockClient() : null;
  }

  /**
   * Returns whether the client is using mock data.
   * @returns True if mock data is being used instead of the live API.
   */
  useMock(): boolean {
    return this.isMock;
  }

  /**
   * Retrieves the list of connected accounts.
   * @returns The list of connected accounts.
   */
  async fetchAccounts(): Promise<Account[]> {
    if (this.mockClient) {
      return this.mockClient.fetchAccounts();
    }

    const response = await this.request<ApiAccount[]>("/accounts");
    return response.map(accountFromApi);
  }

  /**
   * Retrieves chats, optionally filtered by account ID.
   * @param accountId - The account ID to filter chats by.
   * @returns The list of chats for the given account.
   */
  async fetchChats(accountId: string): Promise<Chat[]> {
    if (this.mockClient) {
      return this.mockClient.fetchChats(accountId);
    }

    const params = accountId && accountId !== ALL_ACCOUNTS_ID ? `?account_ids=${accountId}` : "";
    const response = await this.request<ApiChatListResponse>(`/chats${params}`);
    // API may return null items despite the type definition
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (response.items ?? []).map(chatFromApi);
  }

  /**
   * Retrieves messages for a chat.
   * @param chatId - The ID of the chat to fetch messages for.
   * @returns The list of messages in the chat.
   */
  async fetchMessages(chatId: string): Promise<Message[]> {
    if (this.mockClient) {
      return this.mockClient.fetchMessages(chatId);
    }

    const response = await this.request<ApiMessageListResponse>(`/chats/${chatId}/messages`);
    // API may return null items despite the type definition
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const messages = (response.items ?? []).map(messageFromApi);
    return messages.reverse();
  }

  /**
   * Sends a text message to the specified chat.
   * @param chatId - The ID of the chat to send the message to.
   * @param body - The text content of the message.
   * @returns Resolves when the message is sent.
   */
  async sendMessage(chatId: string, body: string): Promise<void> {
    if (this.mockClient) {
      return this.mockClient.sendMessage(chatId, body);
    }

    await this.request(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text: body }),
    });
  }

  /**
   * Archives or unarchives a chat.
   * @param chatId - The ID of the chat to archive or unarchive.
   * @param archive - Whether to archive (true) or unarchive (false) the chat.
   * @returns Resolves when the operation completes.
   */
  async archiveChat(chatId: string, archive: boolean): Promise<void> {
    if (this.mockClient) {
      return this.mockClient.archiveChat(chatId, archive);
    }

    await this.request(`/chats/${chatId}/archive`, {
      method: "POST",
      body: JSON.stringify({ archived: archive }),
    });
  }

  /**
   * Makes an authenticated HTTP request to the Beeper API.
   * @param path - The API endpoint path to request.
   * @param init - Optional fetch request configuration.
   * @returns The parsed JSON response.
   */
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}

/* API response types for type-safe deserialization. */

interface ApiAccount {
  readonly account_id: string;
  readonly user: {
    readonly full_name?: string;
    readonly username?: string;
  };
}

interface ApiChatListItem {
  readonly id: string;
  readonly account_id: string;
  readonly title: string;
  readonly preview: { readonly text: string };
  readonly last_activity: string;
  readonly unread_count: number;
  readonly is_pinned: boolean;
  readonly is_muted: boolean;
}

interface ApiChatListResponse {
  readonly items: ApiChatListItem[];
}

interface ApiMessage {
  readonly id: string;
  readonly chat_id: string;
  readonly sender_name?: string;
  readonly sender_id?: string;
  readonly is_sender: boolean;
  readonly text?: string;
  readonly attachments?: unknown[];
  readonly timestamp: string;
}

interface ApiMessageListResponse {
  readonly items: ApiMessage[];
}

/**
 * Converts an API account to a domain Account.
 * @param acct - The raw API account object to convert.
 * @returns The converted domain Account.
 */
function accountFromApi(acct: ApiAccount): Account {
  let name = acct.user.full_name ?? "";
  if (!name) {
    name = acct.user.username ?? "";
  }

  if (!name) {
    name = acct.account_id;
  }

  return {
    id: acct.account_id,
    name,
    protocol: acct.account_id,
    connected: true,
  };
}

/**
 * Converts an API chat list item to a domain Chat.
 * @param item - The raw API chat list item to convert.
 * @returns The converted domain Chat.
 */
function chatFromApi(item: ApiChatListItem): Chat {
  return {
    id: item.id,
    accountId: item.account_id,
    name: item.title,
    lastMessage: item.preview.text,
    lastMessageTime: new Date(item.last_activity),
    unreadCount: item.unread_count,
    pinned: item.is_pinned,
    muted: item.is_muted,
  };
}

/**
 * Converts an API message to a domain Message.
 * @param msg - The raw API message object to convert.
 * @returns The converted domain Message.
 */
function messageFromApi(msg: ApiMessage): Message {
  let sender = msg.sender_name ?? msg.sender_id ?? "";
  if (msg.is_sender) {
    sender = "You";
  }

  let body = msg.text ?? "";
  if (!body && msg.attachments && msg.attachments.length > 0) {
    body = "[Attachment]";
  }

  return {
    id: msg.id,
    chatId: msg.chat_id,
    sender,
    body,
    timestamp: new Date(msg.timestamp),
    isFromMe: msg.is_sender,
  };
}

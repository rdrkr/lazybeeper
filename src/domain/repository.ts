// Copyright (c) 2026 lazybeeper by Ronen Druker.

import type { Account, Chat, Message } from "./types.js";

/**
 * Repository defines the interface for data access operations.
 */
export interface Repository {
  /** Retrieves the list of connected accounts. */
  fetchAccounts(): Promise<Account[]>;
  /** Retrieves chats, optionally filtered by account ID. */
  fetchChats(accountId: string): Promise<Chat[]>;
  /** Retrieves messages for a chat. */
  fetchMessages(chatId: string): Promise<Message[]>;
  /** Sends a text message to the specified chat. */
  sendMessage(chatId: string, body: string): Promise<void>;
  /** Archives or unarchives a chat. */
  archiveChat(chatId: string, archive: boolean): Promise<void>;
  /** Returns whether the repository is using mock data. */
  useMock(): boolean;
}

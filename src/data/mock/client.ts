// Copyright (c) 2026 lazybeeper by Ronen Druker.

import type { Repository } from "../../domain/repository.js";
import type { Account, Chat, Message } from "../../domain/types.js";
import { ALL_ACCOUNTS_ID } from "../../domain/types.js";
import { getAccounts, getChats, getMessages } from "./data.js";

/**
 * MockClient implements Repository using hardcoded mock data.
 */
export class MockClient implements Repository {
  /** Additional messages appended via sendMessage in mock mode. */
  private readonly extraMessages = new Map<string, Message[]>();

  /**
   * Returns mock account data.
   * @returns The list of mock accounts.
   */
  async fetchAccounts(): Promise<Account[]> {
    return Promise.resolve(getAccounts());
  }

  /**
   * Returns mock chat data for the given account.
   * When accountId is ALL_ACCOUNTS_ID, returns chats from all accounts.
   * @param accountId - The account ID to retrieve chats for.
   * @returns The list of mock chats for the account.
   */
  async fetchChats(accountId: string): Promise<Chat[]> {
    if (accountId === ALL_ACCOUNTS_ID) {
      const accounts = getAccounts();
      const allChats = accounts.flatMap((acct) => getChats(acct.id));
      return Promise.resolve(allChats);
    }
    return Promise.resolve(getChats(accountId));
  }

  /**
   * Returns mock message data for the given chat, including locally sent messages.
   * @param chatId - The chat ID to retrieve messages for.
   * @returns The list of mock messages for the chat.
   */
  async fetchMessages(chatId: string): Promise<Message[]> {
    const base = getMessages(chatId);
    const extra = this.extraMessages.get(chatId) ?? [];
    return Promise.resolve([...base, ...extra]);
  }

  /**
   * Appends the message to local mock storage.
   * @param chatId - The chat ID to send the message to.
   * @param body - The text content of the message.
   * @returns Resolves when the message is stored.
   */
  async sendMessage(chatId: string, body: string): Promise<void> {
    const now = new Date();
    const newMsg: Message = {
      id: `local-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`,
      chatId,
      sender: "You",
      body,
      timestamp: now,
      isFromMe: true,
    };

    const existing = this.extraMessages.get(chatId) ?? [];
    this.extraMessages.set(chatId, [...existing, newMsg]);
    return Promise.resolve();
  }

  /**
   * No-op for mock mode.
   * @param _chatId - The chat ID (unused in mock mode).
   * @param _archive - Whether to archive or unarchive (unused in mock mode).
   * @returns Resolves immediately.
   */
  async archiveChat(_chatId: string, _archive: boolean): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Always returns true for the mock client.
   * @returns Always true.
   */
  useMock(): boolean {
    return true;
  }
}

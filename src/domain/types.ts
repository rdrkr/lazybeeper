// Copyright (c) 2026 lazybeeper by Ronen Druker.

/** Sentinel account ID for the "All" virtual account. */
export const ALL_ACCOUNTS_ID = "__all__";

/**
 * Account represents a messaging account (e.g., iMessage, Slack, Signal).
 */
export interface Account {
  /** Unique identifier for this account. */
  readonly id: string;
  /** Display name of the account. */
  readonly name: string;
  /** Messaging protocol (e.g., "imessage", "slack"). */
  readonly protocol: string;
  /** Whether the account is currently online. */
  readonly connected: boolean;
}

/**
 * Chat represents a conversation thread.
 */
export interface Chat {
  /** Unique identifier for this chat. */
  readonly id: string;
  /** Links this chat to its parent account. */
  readonly accountId: string;
  /** Display name of the chat. */
  readonly name: string;
  /** Preview of the most recent message. */
  readonly lastMessage: string;
  /** When the most recent message was sent. */
  readonly lastMessageTime: Date;
  /** Number of unread messages. */
  readonly unreadCount: number;
  /** Whether this chat is pinned. */
  readonly pinned: boolean;
  /** Whether notifications are muted. */
  readonly muted: boolean;
  /** Optional path to a profile avatar image. */
  readonly avatarPath?: string;
}

/**
 * Message represents a single message in a chat.
 */
export interface Message {
  /** Unique identifier for this message. */
  readonly id: string;
  /** Links this message to its parent chat. */
  readonly chatId: string;
  /** Display name of the sender. */
  readonly sender: string;
  /** Text content of the message. */
  readonly body: string;
  /** When the message was sent. */
  readonly timestamp: Date;
  /** Whether the current user sent this message. */
  readonly isFromMe: boolean;
}

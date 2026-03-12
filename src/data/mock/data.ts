// Copyright (c) 2026 lazybeeper by Ronen Druker.

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Account, Chat, Message } from "../../domain/types.js";

/** Directory containing mock avatar images. */
const AVATARS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "avatars");

/**
 * Returns hardcoded account data for development.
 * @returns The list of mock accounts.
 */
export function getAccounts(): Account[] {
  return [
    { id: "imessage", name: "iMessage", protocol: "imessage", connected: true },
    { id: "slack", name: "Slack", protocol: "slack", connected: true },
    { id: "signal", name: "Signal", protocol: "signal", connected: false },
    { id: "whatsapp", name: "WhatsApp", protocol: "whatsapp", connected: true },
  ];
}

/**
 * Returns hardcoded chat data for a given account for development.
 * @param accountId - The account ID to retrieve chats for.
 * @returns The list of mock chats for the account.
 */
export function getChats(accountId: string): Chat[] {
  const now = new Date();

  const allChats: Record<string, Chat[]> = {
    imessage: [
      {
        id: "chat1",
        accountId: "imessage",
        name: "Alice",
        lastMessage: "Want to grab lunch?",
        lastMessageTime: new Date(now.getTime() - 2 * 60_000),
        unreadCount: 2,
        pinned: false,
        muted: false,
        avatarPath: path.join(AVATARS_DIR, "alice.png"),
      },
      {
        id: "chat2",
        accountId: "imessage",
        name: "Bob",
        lastMessage: "See you tomorrow!",
        lastMessageTime: new Date(now.getTime() - 15 * 60_000),
        unreadCount: 0,
        pinned: false,
        muted: false,
        avatarPath: path.join(AVATARS_DIR, "bob.png"),
      },
      {
        id: "chat3",
        accountId: "imessage",
        name: "Family Group",
        lastMessage: "Mom: Happy birthday!",
        lastMessageTime: new Date(now.getTime() - 60 * 60_000),
        unreadCount: 5,
        pinned: true,
        muted: false,
      },
      {
        id: "chat4",
        accountId: "imessage",
        name: "Dave",
        lastMessage: "Thanks for the help",
        lastMessageTime: new Date(now.getTime() - 180 * 60_000),
        unreadCount: 0,
        pinned: false,
        muted: true,
      },
    ],
    slack: [
      {
        id: "chat5",
        accountId: "slack",
        name: "#general",
        lastMessage: "Welcome new team members!",
        lastMessageTime: new Date(now.getTime() - 5 * 60_000),
        unreadCount: 12,
        pinned: false,
        muted: false,
      },
      {
        id: "chat6",
        accountId: "slack",
        name: "#engineering",
        lastMessage: "Deploy complete",
        lastMessageTime: new Date(now.getTime() - 30 * 60_000),
        unreadCount: 0,
        pinned: false,
        muted: false,
      },
      {
        id: "chat7",
        accountId: "slack",
        name: "Carol (DM)",
        lastMessage: "PR looks good",
        lastMessageTime: new Date(now.getTime() - 45 * 60_000),
        unreadCount: 1,
        pinned: false,
        muted: false,
        avatarPath: path.join(AVATARS_DIR, "carol.png"),
      },
    ],
    signal: [
      {
        id: "chat8",
        accountId: "signal",
        name: "Eve",
        lastMessage: "Call me when you can",
        lastMessageTime: new Date(now.getTime() - 120 * 60_000),
        unreadCount: 1,
        pinned: false,
        muted: false,
      },
    ],
    whatsapp: [
      {
        id: "chat9",
        accountId: "whatsapp",
        name: "Team Chat",
        lastMessage: "Meeting at 3pm",
        lastMessageTime: new Date(now.getTime() - 10 * 60_000),
        unreadCount: 3,
        pinned: false,
        muted: false,
      },
      {
        id: "chat10",
        accountId: "whatsapp",
        name: "Frank",
        lastMessage: "Got it, thanks!",
        lastMessageTime: new Date(now.getTime() - 240 * 60_000),
        unreadCount: 0,
        pinned: false,
        muted: false,
      },
    ],
  };

  return allChats[accountId] ?? [];
}

/**
 * Returns hardcoded message data for a given chat for development.
 * @param chatId - The chat ID to retrieve messages for.
 * @returns The list of mock messages for the chat.
 */
export function getMessages(chatId: string): Message[] {
  const now = new Date();

  const allMessages: Record<string, Message[]> = {
    chat1: [
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
        body: "I'm good, thanks! How about you?",
        timestamp: new Date(now.getTime() - 8 * 60_000),
        isFromMe: true,
      },
      {
        id: "m3",
        chatId: "chat1",
        sender: "Alice",
        body: "Doing great! Just finished that project.",
        timestamp: new Date(now.getTime() - 6 * 60_000),
        isFromMe: false,
      },
      {
        id: "m4",
        chatId: "chat1",
        sender: "You",
        body: "Nice! Congrats!",
        timestamp: new Date(now.getTime() - 5 * 60_000),
        isFromMe: true,
      },
      {
        id: "m5",
        chatId: "chat1",
        sender: "Alice",
        body: "Want to grab lunch?",
        timestamp: new Date(now.getTime() - 2 * 60_000),
        isFromMe: false,
      },
    ],
    chat2: [
      {
        id: "m6",
        chatId: "chat2",
        sender: "Bob",
        body: "Hey, are we still on for tomorrow?",
        timestamp: new Date(now.getTime() - 30 * 60_000),
        isFromMe: false,
      },
      {
        id: "m7",
        chatId: "chat2",
        sender: "You",
        body: "Yep, 10am works for me",
        timestamp: new Date(now.getTime() - 25 * 60_000),
        isFromMe: true,
      },
      {
        id: "m8",
        chatId: "chat2",
        sender: "Bob",
        body: "See you tomorrow!",
        timestamp: new Date(now.getTime() - 15 * 60_000),
        isFromMe: false,
      },
    ],
    chat5: [
      {
        id: "m9",
        chatId: "chat5",
        sender: "Admin",
        body: "Welcome new team members!",
        timestamp: new Date(now.getTime() - 5 * 60_000),
        isFromMe: false,
      },
      {
        id: "m10",
        chatId: "chat5",
        sender: "You",
        body: "Welcome everyone!",
        timestamp: new Date(now.getTime() - 4 * 60_000),
        isFromMe: true,
      },
    ],
  };

  return (
    allMessages[chatId] ?? [
      {
        id: "md1",
        chatId,
        sender: "Someone",
        body: "Hello!",
        timestamp: new Date(now.getTime() - 60 * 60_000),
        isFromMe: false,
      },
      {
        id: "md2",
        chatId,
        sender: "You",
        body: "Hi there!",
        timestamp: new Date(now.getTime() - 55 * 60_000),
        isFromMe: true,
      },
    ]
  );
}

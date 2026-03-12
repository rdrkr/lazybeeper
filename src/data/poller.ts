// Copyright (c) 2026 lazybeeper by Ronen Druker.

/** How often the chat list is refreshed (ms). */
export const CHAT_POLL_INTERVAL = 5_000;

/** How often the active chat messages are refreshed (ms). */
export const MESSAGE_POLL_INTERVAL = 3_000;

/** Polling interval when no changes are detected (ms). */
export const IDLE_BACKOFF_INTERVAL = 15_000;

/** How long without changes before polling backs off (ms). */
export const IDLE_TIMEOUT = 30_000;

/** Identifies the type of polling tick. */
export enum TickKind {
  /** Polls the chat list. */
  ChatTick = "chat",
  /** Polls the active chat's messages. */
  MessageTick = "message",
}

/**
 * Poller manages polling state and idle backoff logic.
 */
export class Poller {
  private lastChatChange: number;
  private lastMsgChange: number;
  private lastChatCount = 0;
  private lastMsgCount = 0;
  private enabled = true;

  constructor() {
    const now = Date.now();
    this.lastChatChange = now;
    this.lastMsgChange = now;
  }

  /**
   * Turns polling on or off.
   * @param enabled - Whether polling should be enabled.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Returns whether polling is currently enabled.
   * @returns True if polling is enabled.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Records that the chat list has changed.
   * @param count - The current number of chats.
   */
  notifyChatChange(count: number): void {
    if (count !== this.lastChatCount) {
      this.lastChatChange = Date.now();
      this.lastChatCount = count;
    }
  }

  /**
   * Records that the message list has changed.
   * @param count - The current number of messages.
   */
  notifyMsgChange(count: number): void {
    if (count !== this.lastMsgCount) {
      this.lastMsgChange = Date.now();
      this.lastMsgCount = count;
    }
  }

  /**
   * Returns the appropriate chat poll interval, using idle backoff.
   * @returns The poll interval in milliseconds.
   */
  chatInterval(): number {
    if (!this.enabled) {
      return 0;
    }

    if (Date.now() - this.lastChatChange > IDLE_TIMEOUT) {
      return IDLE_BACKOFF_INTERVAL;
    }

    return CHAT_POLL_INTERVAL;
  }

  /**
   * Returns the appropriate message poll interval, using idle backoff.
   * @returns The poll interval in milliseconds.
   */
  messageInterval(): number {
    if (!this.enabled) {
      return 0;
    }

    if (Date.now() - this.lastMsgChange > IDLE_TIMEOUT) {
      return IDLE_BACKOFF_INTERVAL;
    }

    return MESSAGE_POLL_INTERVAL;
  }
}

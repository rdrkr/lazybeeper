// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  Poller,
  CHAT_POLL_INTERVAL,
  MESSAGE_POLL_INTERVAL,
  IDLE_BACKOFF_INTERVAL,
  IDLE_TIMEOUT,
  TickKind,
} from "../../src/data/poller.js";

describe("TickKind", () => {
  it("has correct enum values", () => {
    expect(TickKind.ChatTick).toBe("chat");
    expect(TickKind.MessageTick).toBe("message");
  });
});

describe("exported constants", () => {
  it("CHAT_POLL_INTERVAL is 5000", () => {
    expect(CHAT_POLL_INTERVAL).toBe(5_000);
  });

  it("MESSAGE_POLL_INTERVAL is 3000", () => {
    expect(MESSAGE_POLL_INTERVAL).toBe(3_000);
  });

  it("IDLE_BACKOFF_INTERVAL is 15000", () => {
    expect(IDLE_BACKOFF_INTERVAL).toBe(15_000);
  });

  it("IDLE_TIMEOUT is 30000", () => {
    expect(IDLE_TIMEOUT).toBe(30_000);
  });
});

describe("Poller", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("creates an enabled poller", () => {
      const poller = new Poller();
      expect(poller.isEnabled()).toBe(true);
    });
  });

  describe("setEnabled / isEnabled", () => {
    it("can disable polling", () => {
      const poller = new Poller();
      poller.setEnabled(false);
      expect(poller.isEnabled()).toBe(false);
    });

    it("can re-enable polling", () => {
      const poller = new Poller();
      poller.setEnabled(false);
      poller.setEnabled(true);
      expect(poller.isEnabled()).toBe(true);
    });
  });

  describe("chatInterval", () => {
    it("returns CHAT_POLL_INTERVAL when recently active", () => {
      const poller = new Poller();
      expect(poller.chatInterval()).toBe(CHAT_POLL_INTERVAL);
    });

    it("returns 0 when disabled", () => {
      const poller = new Poller();
      poller.setEnabled(false);
      expect(poller.chatInterval()).toBe(0);
    });

    it("returns IDLE_BACKOFF_INTERVAL after idle timeout", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      expect(poller.chatInterval()).toBe(IDLE_BACKOFF_INTERVAL);
    });

    it("returns CHAT_POLL_INTERVAL right at idle timeout boundary", () => {
      const poller = new Poller();
      // Advance exactly to IDLE_TIMEOUT -- not past it
      vi.advanceTimersByTime(IDLE_TIMEOUT);
      expect(poller.chatInterval()).toBe(CHAT_POLL_INTERVAL);
    });

    it("returns normal interval after notifyChatChange resets timer", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      expect(poller.chatInterval()).toBe(IDLE_BACKOFF_INTERVAL);
      // Notify a change with different count
      poller.notifyChatChange(5);
      expect(poller.chatInterval()).toBe(CHAT_POLL_INTERVAL);
    });
  });

  describe("messageInterval", () => {
    it("returns MESSAGE_POLL_INTERVAL when recently active", () => {
      const poller = new Poller();
      expect(poller.messageInterval()).toBe(MESSAGE_POLL_INTERVAL);
    });

    it("returns 0 when disabled", () => {
      const poller = new Poller();
      poller.setEnabled(false);
      expect(poller.messageInterval()).toBe(0);
    });

    it("returns IDLE_BACKOFF_INTERVAL after idle timeout", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      expect(poller.messageInterval()).toBe(IDLE_BACKOFF_INTERVAL);
    });

    it("returns MESSAGE_POLL_INTERVAL right at idle timeout boundary", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT);
      expect(poller.messageInterval()).toBe(MESSAGE_POLL_INTERVAL);
    });

    it("returns normal interval after notifyMsgChange resets timer", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      expect(poller.messageInterval()).toBe(IDLE_BACKOFF_INTERVAL);
      poller.notifyMsgChange(10);
      expect(poller.messageInterval()).toBe(MESSAGE_POLL_INTERVAL);
    });
  });

  describe("notifyChatChange", () => {
    it("does not reset timer when count is the same", () => {
      const poller = new Poller();
      // Initially lastChatCount is 0, notify with 0 (same)
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      poller.notifyChatChange(0);
      // Should still be backed off because count didn't change
      expect(poller.chatInterval()).toBe(IDLE_BACKOFF_INTERVAL);
    });

    it("resets timer when count changes", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      poller.notifyChatChange(3);
      expect(poller.chatInterval()).toBe(CHAT_POLL_INTERVAL);
    });

    it("does not reset timer on subsequent call with same count", () => {
      const poller = new Poller();
      poller.notifyChatChange(5);
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      // Same count as before -- no reset
      poller.notifyChatChange(5);
      expect(poller.chatInterval()).toBe(IDLE_BACKOFF_INTERVAL);
    });
  });

  describe("notifyMsgChange", () => {
    it("does not reset timer when count is the same", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      poller.notifyMsgChange(0);
      expect(poller.messageInterval()).toBe(IDLE_BACKOFF_INTERVAL);
    });

    it("resets timer when count changes", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      poller.notifyMsgChange(7);
      expect(poller.messageInterval()).toBe(MESSAGE_POLL_INTERVAL);
    });

    it("does not reset timer on subsequent call with same count", () => {
      const poller = new Poller();
      poller.notifyMsgChange(4);
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      poller.notifyMsgChange(4);
      expect(poller.messageInterval()).toBe(IDLE_BACKOFF_INTERVAL);
    });
  });

  describe("independent chat and message tracking", () => {
    it("chat and message intervals are tracked independently", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      // Only reset chat, not message
      poller.notifyChatChange(1);
      expect(poller.chatInterval()).toBe(CHAT_POLL_INTERVAL);
      expect(poller.messageInterval()).toBe(IDLE_BACKOFF_INTERVAL);
    });

    it("message change does not affect chat interval", () => {
      const poller = new Poller();
      vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
      poller.notifyMsgChange(1);
      expect(poller.chatInterval()).toBe(IDLE_BACKOFF_INTERVAL);
      expect(poller.messageInterval()).toBe(MESSAGE_POLL_INTERVAL);
    });
  });
});

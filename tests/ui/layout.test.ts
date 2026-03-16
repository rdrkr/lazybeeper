// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import { calculateLayout } from "../../src/ui/layout.js";

describe("calculateLayout", () => {
  describe("sidebar width calculation", () => {
    it("clamps sidebar to minimum width of 25 for small terminals", () => {
      const layout = calculateLayout(60, 30);
      // 30% of 60 = 18, clamped to min 25
      expect(layout.sidebarWidth).toBe(25);
    });

    it("clamps sidebar to maximum width of 40 for large terminals", () => {
      const layout = calculateLayout(200, 50);
      // 30% of 200 = 60, clamped to max 40
      expect(layout.sidebarWidth).toBe(40);
    });

    it("uses percentage-based width when within range", () => {
      const layout = calculateLayout(100, 30);
      // 30% of 100 = 30, within [25, 40]
      expect(layout.sidebarWidth).toBe(30);
    });
  });

  describe("main width calculation", () => {
    it("sets mainWidth as totalWidth minus sidebarWidth", () => {
      const layout = calculateLayout(100, 30);
      expect(layout.mainWidth).toBe(100 - layout.sidebarWidth);
    });
  });

  describe("totalWidth and totalHeight", () => {
    it("preserves the input width and height", () => {
      const layout = calculateLayout(120, 40);
      expect(layout.totalWidth).toBe(120);
      expect(layout.totalHeight).toBe(40);
    });
  });

  describe("status bar height", () => {
    it("is always 1", () => {
      const layout = calculateLayout(100, 30);
      expect(layout.statusBarHeight).toBe(1);
    });
  });

  describe("accounts and chats height", () => {
    it("allocates 30% of usable height to accounts", () => {
      const layout = calculateLayout(100, 41);
      // usableHeight = 41 - 1 = 40, accountsHeight = floor(40 * 30 / 100) = 12
      expect(layout.accountsHeight).toBe(12);
      expect(layout.chatsHeight).toBe(28);
    });

    it("enforces minimum accountsHeight of 3", () => {
      const layout = calculateLayout(100, 5);
      // usableHeight = 5 - 1 = 4, floor(4 * 30 / 100) = 1, clamped to 3
      expect(layout.accountsHeight).toBe(3);
      expect(layout.chatsHeight).toBe(1);
    });
  });

  describe("messages and input height", () => {
    it("sets input height to 6 for normal terminals", () => {
      const layout = calculateLayout(100, 40);
      expect(layout.inputHeight).toBe(6);
    });

    it("calculates messagesHeight as usableHeight minus inputHeight", () => {
      const layout = calculateLayout(100, 40);
      // usableHeight = 39, messagesHeight = 39 - 6 = 33
      expect(layout.messagesHeight).toBe(33);
    });

    it("enforces minimum messagesHeight of 3 and adjusts inputHeight", () => {
      // usableHeight = 6 - 1 = 5, messagesHeight = 5 - 6 = -1 < 3
      // so messagesHeight = 3, inputHeight = 5 - 3 = 2 < 3, so inputHeight = 3
      const layout = calculateLayout(100, 6);
      expect(layout.messagesHeight).toBe(3);
      expect(layout.inputHeight).toBe(3);
    });

    it("adjusts inputHeight when messagesHeight is forced to minimum", () => {
      // usableHeight = 10 - 1 = 9, messagesHeight = 9 - 6 = 3 >= 3
      const layout = calculateLayout(100, 10);
      expect(layout.messagesHeight).toBe(3);
      expect(layout.inputHeight).toBe(6);
    });

    it("handles messagesHeight exactly at minimum boundary", () => {
      // usableHeight = 10 - 1 = 9, messagesHeight = 9 - 6 = 3, exactly at min
      const layout = calculateLayout(100, 10);
      expect(layout.messagesHeight).toBe(3);
      expect(layout.inputHeight).toBe(6);
    });

    it("recalculates inputHeight from usableHeight when messages clamped", () => {
      // usableHeight = 8 - 1 = 7, messagesHeight = 7 - 6 = 1 < 3
      // messagesHeight = 3, inputHeight = 7 - 3 = 4 >= 3
      const layout = calculateLayout(100, 8);
      expect(layout.messagesHeight).toBe(3);
      expect(layout.inputHeight).toBe(4);
    });
  });

  describe("edge cases", () => {
    it("handles zero height", () => {
      const layout = calculateLayout(100, 0);
      // usableHeight = max(0 - 1, 0) = 0 (clamped)
      // accountsHeight = floor(0 * 30 / 100) = 0 < 3, so 3
      // chatsHeight = 0 - 3 = -3
      // messagesHeight = 0 - 5 = -5 < 3, so 3
      // inputHeight = 0 - 3 = -3 < 3, so 3
      expect(layout.accountsHeight).toBe(3);
      expect(layout.messagesHeight).toBe(3);
      expect(layout.inputHeight).toBe(3);
    });

    it("handles height of 1 (only status bar)", () => {
      const layout = calculateLayout(100, 1);
      // usableHeight = 0
      expect(layout.accountsHeight).toBe(3);
      expect(layout.chatsHeight).toBe(-3);
      expect(layout.messagesHeight).toBe(3);
      expect(layout.inputHeight).toBe(3);
    });

    it("handles very large terminal", () => {
      const layout = calculateLayout(300, 100);
      expect(layout.sidebarWidth).toBe(40);
      expect(layout.mainWidth).toBe(260);
      expect(layout.totalWidth).toBe(300);
      expect(layout.totalHeight).toBe(100);
    });
  });
});

// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { describe, it, expect } from "vitest";
import {
  PopupType,
  createInitialState,
  appReducer,
} from "../../../../src/ui/viewmodel/use-app-state.js";
import { PanelFocus } from "../../../../src/ui/viewmodel/context.js";
import { ChatAction } from "../../../../src/ui/viewmodel/messages.js";
import type { Account, Chat, Message } from "../../../../src/domain/types.js";
import { ALL_ACCOUNTS_ID } from "../../../../src/domain/types.js";

const mockAccount: Account = {
  id: "imessage",
  name: "iMessage",
  protocol: "imessage",
  connected: true,
};

const mockChat: Chat = {
  id: "chat1",
  accountId: "imessage",
  name: "Alice",
  lastMessage: "Hello",
  lastMessageTime: new Date(),
  unreadCount: 2,
  pinned: false,
  muted: false,
};

const mockChat2: Chat = {
  id: "chat2",
  accountId: "imessage",
  name: "Bob",
  lastMessage: "Hi",
  lastMessageTime: new Date(),
  unreadCount: 0,
  pinned: true,
  muted: true,
};

const mockMessage: Message = {
  id: "m1",
  chatId: "chat1",
  sender: "Alice",
  body: "Hey",
  timestamp: new Date(),
  isFromMe: false,
};

describe("PopupType", () => {
  it("has correct enum values", () => {
    expect(PopupType.Search).toBe("search");
    expect(PopupType.Help).toBe("help");
    expect(PopupType.Confirm).toBe("confirm");
  });
});

describe("createInitialState", () => {
  it("creates non-mock state", () => {
    const state = createInitialState(false);
    expect(state.isMock).toBe(false);
    expect(state.ready).toBe(false);
    expect(state.focus).toBe(PanelFocus.Accounts);
    expect(state.activeAccountId).toBe("");
    expect(state.activeChatId).toBe("");
    expect(state.accounts).toEqual([]);
    expect(state.chats).toEqual([]);
    expect(state.messages).toEqual([]);
    expect(state.activePopup).toBeNull();
    expect(state.errorMessage).toBe("");
    expect(state.errorTime).toBe(0);
  });

  it("creates mock state with error message", () => {
    const state = createInitialState(true);
    expect(state.isMock).toBe(true);
    expect(state.errorMessage).toContain("mock data");
    expect(state.errorTime).toBeGreaterThan(0);
  });
});

describe("appReducer", () => {
  describe("resize", () => {
    it("updates layout and sets ready", () => {
      const state = createInitialState(false);
      const result = appReducer(state, { type: "resize", width: 120, height: 40 });
      expect(result.ready).toBe(true);
      expect(result.layout.totalWidth).toBe(120);
      expect(result.layout.totalHeight).toBe(40);
    });
  });

  describe("accounts_loaded", () => {
    it("prepends All virtual account to list", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "accounts_loaded",
        accounts: [mockAccount],
      });
      expect(result.accounts).toHaveLength(2);
      expect(result.accounts[0]?.id).toBe(ALL_ACCOUNTS_ID);
      expect(result.accounts[0]?.name).toBe("All");
      expect(result.accounts[1]?.id).toBe("imessage");
    });

    it("auto-selects All account when none active", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "accounts_loaded",
        accounts: [mockAccount],
      });
      expect(result.activeAccountId).toBe(ALL_ACCOUNTS_ID);
    });

    it("does not auto-select when account already active", () => {
      const state = { ...createInitialState(false), activeAccountId: "slack" };
      const result = appReducer(state, {
        type: "accounts_loaded",
        accounts: [mockAccount],
      });
      expect(result.activeAccountId).toBe("slack");
    });

    it("adds All even when real accounts list is empty", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "accounts_loaded",
        accounts: [],
      });
      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0]?.id).toBe(ALL_ACCOUNTS_ID);
      expect(result.activeAccountId).toBe(ALL_ACCOUNTS_ID);
    });
  });

  describe("account_selected", () => {
    it("updates active account ID", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "account_selected",
        account: mockAccount,
      });
      expect(result.activeAccountId).toBe("imessage");
    });
  });

  describe("chats_loaded", () => {
    it("sets chats list", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "chats_loaded",
        chats: [mockChat, mockChat2],
      });
      expect(result.chats).toHaveLength(2);
    });

    it("auto-selects first chat when none active", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "chats_loaded",
        chats: [mockChat],
      });
      expect(result.activeChatId).toBe("chat1");
      expect(result.activeChatName).toBe("Alice");
    });

    it("does not auto-select when chat already active", () => {
      const state = { ...createInitialState(false), activeChatId: "chat5" };
      const result = appReducer(state, {
        type: "chats_loaded",
        chats: [mockChat],
      });
      expect(result.activeChatId).toBe("chat5");
    });

    it("handles empty chats list", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "chats_loaded",
        chats: [],
      });
      expect(result.chats).toHaveLength(0);
      expect(result.activeChatId).toBe("");
    });
  });

  describe("chat_selected", () => {
    it("updates active chat and switches focus to input", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "chat_selected",
        chat: mockChat,
      });
      expect(result.activeChatId).toBe("chat1");
      expect(result.activeChatName).toBe("Alice");
      expect(result.focus).toBe(PanelFocus.Input);
      expect(result.prevFocus).toBe(PanelFocus.Accounts);
    });
  });

  describe("chat_previewed", () => {
    it("updates active chat without changing focus", () => {
      const state = { ...createInitialState(false), focus: PanelFocus.Chats };
      const result = appReducer(state, {
        type: "chat_previewed",
        chat: mockChat,
      });
      expect(result.activeChatId).toBe("chat1");
      expect(result.activeChatName).toBe("Alice");
      expect(result.focus).toBe(PanelFocus.Chats);
    });
  });

  describe("messages_loaded", () => {
    it("sets messages list", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "messages_loaded",
        messages: [mockMessage],
      });
      expect(result.messages).toHaveLength(1);
    });
  });

  describe("send_message", () => {
    it("returns state unchanged", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "send_message",
        chatId: "chat1",
        body: "Hello",
      });
      expect(result).toBe(state);
    });
  });

  describe("message_sent", () => {
    it("returns state unchanged", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "message_sent",
        chatId: "chat1",
      });
      expect(result).toBe(state);
    });
  });

  describe("toggle_mute", () => {
    it("toggles muted state for matching chat", () => {
      const state = { ...createInitialState(false), chats: [mockChat, mockChat2] };
      const result = appReducer(state, { type: "toggle_mute", chatId: "chat1" });
      expect(result.chats[0]?.muted).toBe(true);
      expect(result.chats[1]?.muted).toBe(true); /* was already muted */
    });

    it("does not affect non-matching chats", () => {
      const state = { ...createInitialState(false), chats: [mockChat, mockChat2] };
      const result = appReducer(state, { type: "toggle_mute", chatId: "chat1" });
      expect(result.chats[1]?.pinned).toBe(true);
    });
  });

  describe("toggle_pin", () => {
    it("toggles pinned state for matching chat", () => {
      const state = { ...createInitialState(false), chats: [mockChat, mockChat2] };
      const result = appReducer(state, { type: "toggle_pin", chatId: "chat2" });
      expect(result.chats[1]?.pinned).toBe(false); /* was pinned, now unpinned */
    });
  });

  describe("show_confirm", () => {
    it("activates confirm popup", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "show_confirm",
        message: 'Archive "Alice"?',
        action: ChatAction.Archive,
        data: "chat1",
      });
      expect(result.activePopup).toBe(PopupType.Confirm);
      expect(result.confirmMessage).toBe('Archive "Alice"?');
      expect(result.confirmAction).toBe(ChatAction.Archive);
      expect(result.confirmData).toBe("chat1");
      expect(result.focus).toBe(PanelFocus.Popup);
    });
  });

  describe("confirm_result", () => {
    it("closes popup and restores focus", () => {
      const state = {
        ...createInitialState(false),
        activePopup: PopupType.Confirm as const,
        focus: PanelFocus.Popup,
        prevFocus: PanelFocus.Chats,
      };
      const result = appReducer(state, {
        type: "confirm_result",
        confirmed: true,
        action: ChatAction.Archive,
        data: "chat1",
      });
      expect(result.activePopup).toBeNull();
      expect(result.focus).toBe(PanelFocus.Chats);
    });
  });

  describe("close_popup", () => {
    it("closes popup and restores focus", () => {
      const state = {
        ...createInitialState(false),
        activePopup: PopupType.Search as const,
        focus: PanelFocus.Popup,
        prevFocus: PanelFocus.Accounts,
      };
      const result = appReducer(state, { type: "close_popup" });
      expect(result.activePopup).toBeNull();
      expect(result.focus).toBe(PanelFocus.Accounts);
    });
  });

  describe("search_result_selected", () => {
    it("selects chat and closes popup", () => {
      const state = {
        ...createInitialState(false),
        activePopup: PopupType.Search as const,
      };
      const result = appReducer(state, {
        type: "search_result_selected",
        chat: mockChat,
      });
      expect(result.activePopup).toBeNull();
      expect(result.activeChatId).toBe("chat1");
      expect(result.activeChatName).toBe("Alice");
      expect(result.focus).toBe(PanelFocus.Messages);
    });
  });

  describe("show_search", () => {
    it("activates search popup", () => {
      const state = createInitialState(false);
      const result = appReducer(state, { type: "show_search" });
      expect(result.activePopup).toBe(PopupType.Search);
      expect(result.focus).toBe(PanelFocus.Popup);
    });
  });

  describe("show_help", () => {
    it("activates help popup", () => {
      const state = createInitialState(false);
      const result = appReducer(state, { type: "show_help" });
      expect(result.activePopup).toBe(PopupType.Help);
      expect(result.focus).toBe(PanelFocus.Popup);
    });
  });

  describe("focus_input", () => {
    it("moves focus to input panel", () => {
      const state = createInitialState(false);
      const result = appReducer(state, { type: "focus_input" });
      expect(result.focus).toBe(PanelFocus.Input);
    });
  });

  describe("set_focus", () => {
    it("sets focus to specified panel", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "set_focus",
        focus: PanelFocus.Messages,
      });
      expect(result.focus).toBe(PanelFocus.Messages);
      expect(result.prevFocus).toBe(PanelFocus.Accounts);
    });
  });

  describe("error", () => {
    it("sets error message and timestamp", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "error",
        error: "Connection failed",
      });
      expect(result.errorMessage).toBe("Connection failed");
      expect(result.errorTime).toBeGreaterThan(0);
    });
  });

  describe("archive_chat", () => {
    it("returns state unchanged", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "archive_chat",
        chatId: "chat1",
        archive: true,
      });
      expect(result).toBe(state);
    });
  });

  describe("chat_action_done", () => {
    it("returns state unchanged", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "chat_action_done",
        accountId: "imessage",
      });
      expect(result).toBe(state);
    });
  });

  describe("set_input_value", () => {
    it("returns state unchanged", () => {
      const state = createInitialState(false);
      const result = appReducer(state, {
        type: "set_input_value",
        value: "Hello",
      });
      expect(result).toBe(state);
    });
  });

  describe("show_theme", () => {
    it("activates theme popup, sets focus to Popup, preserves prevFocus", () => {
      const state = {
        ...createInitialState(false),
        focus: PanelFocus.Popup,
        prevFocus: PanelFocus.Chats,
      };
      const result = appReducer(state, { type: "show_theme" });
      expect(result.activePopup).toBe(PopupType.Theme);
      expect(result.focus).toBe(PanelFocus.Popup);
      /* prevFocus is preserved from config popup so closing config restores the right panel. */
      expect(result.prevFocus).toBe(PanelFocus.Chats);
    });
  });

  describe("show_config", () => {
    it("activates config popup, sets focus to Popup, saves prevFocus", () => {
      const state = { ...createInitialState(false), focus: PanelFocus.Chats };
      const result = appReducer(state, { type: "show_config" });
      expect(result.activePopup).toBe(PopupType.Config);
      expect(result.focus).toBe(PanelFocus.Popup);
      expect(result.prevFocus).toBe(PanelFocus.Chats);
    });
  });

  describe("theme_selected", () => {
    it("returns to config popup after theme selection", () => {
      const state = {
        ...createInitialState(false),
        activePopup: PopupType.Theme as const,
        focus: PanelFocus.Popup,
        prevFocus: PanelFocus.Messages,
      };
      const result = appReducer(state, {
        type: "theme_selected",
        themeName: "dracula",
      });
      expect(result.activePopup).toBe(PopupType.Config);
      expect(result.focus).toBe(PanelFocus.Popup);
    });
  });

  describe("close_theme", () => {
    it("returns to config popup on theme escape", () => {
      const state = {
        ...createInitialState(false),
        activePopup: PopupType.Theme as const,
        focus: PanelFocus.Popup,
        prevFocus: PanelFocus.Messages,
      };
      const result = appReducer(state, { type: "close_theme" });
      expect(result.activePopup).toBe(PopupType.Config);
      expect(result.focus).toBe(PanelFocus.Popup);
    });
  });

  describe("reload_config", () => {
    it("returns state unchanged", () => {
      const state = createInitialState(false);
      const result = appReducer(state, { type: "reload_config" });
      expect(result).toBe(state);
    });
  });
});

describe("PopupType.Theme", () => {
  it("has value 'theme'", () => {
    expect(PopupType.Theme).toBe("theme");
  });
});

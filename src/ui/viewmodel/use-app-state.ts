// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { useReducer, useCallback, useEffect, useRef } from "react";
import type { Repository } from "../../domain/repository.js";
import type { Account, Chat, Message } from "../../domain/types.js";
import { ALL_ACCOUNTS_ID } from "../../domain/types.js";
import type { AppAction } from "./messages.js";
import { ChatAction } from "./messages.js";
import { PanelFocus, nextPanel, prevPanel, leftPanel, rightPanel } from "./context.js";
import { Poller } from "../../data/poller.js";
import { calculateLayout } from "../layout.js";
import type { Layout } from "../layout.js";

/** Identifies which popup is currently active. */
export enum PopupType {
  /** Search popup. */
  Search = "search",
  /** Help popup. */
  Help = "help",
  /** Confirm popup. */
  Confirm = "confirm",
  /** Theme selection popup. */
  Theme = "theme",
  /** Configuration popup. */
  Config = "config",
}

/** The complete application state. */
export interface AppState {
  /** Current layout dimensions. */
  readonly layout: Layout;
  /** Whether the app has received its initial resize. */
  readonly ready: boolean;
  /** Current panel focus. */
  readonly focus: PanelFocus;
  /** Previous panel focus (for restoring after popup). */
  readonly prevFocus: PanelFocus;

  /** Currently selected account ID. */
  readonly activeAccountId: string;
  /** Currently selected chat ID. */
  readonly activeChatId: string;
  /** Display name of the active chat. */
  readonly activeChatName: string;

  /** List of accounts. */
  readonly accounts: Account[];
  /** List of chats for the active account. */
  readonly chats: Chat[];
  /** List of messages for the active chat. */
  readonly messages: Message[];

  /** Counter incremented on resize to trigger chat reload. */
  readonly resizeKey: number;
  /** Whether mock mode is active. */
  readonly isMock: boolean;
  /** Error message to display. */
  readonly errorMessage: string;
  /** Timestamp when the error was set. */
  readonly errorTime: number;
  /** Duration in ms after which the error auto-clears (0 = default 10s). */
  readonly errorDuration: number;

  /** Currently active popup, or null. */
  readonly activePopup: PopupType | null;
  /** Confirm popup message. */
  readonly confirmMessage: string;
  /** Confirm popup action. */
  readonly confirmAction: ChatAction;
  /** Confirm popup data (e.g., chat ID). */
  readonly confirmData: string;
}

/**
 * Creates the initial application state.
 * @param isMock - Whether mock mode is active.
 * @returns The initial application state.
 */
export function createInitialState(isMock: boolean): AppState {
  return {
    layout: calculateLayout(80, 24),
    ready: false,
    focus: PanelFocus.Accounts,
    prevFocus: PanelFocus.Accounts,
    activeAccountId: "",
    activeChatId: "",
    activeChatName: "",
    accounts: [],
    chats: [],
    messages: [],
    resizeKey: 0,
    isMock,
    errorMessage: isMock ? "No BEEPER_TOKEN \u2014 using mock data" : "",
    errorTime: isMock ? Date.now() : 0,
    errorDuration: 0,
    activePopup: null,
    confirmMessage: "",
    confirmAction: ChatAction.Archive,
    confirmData: "",
  };
}

/**
 * Reduces application actions into new state.
 * @param state - The current application state.
 * @param action - The action to apply.
 * @returns The new application state after applying the action.
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "resize":
      return {
        ...state,
        layout: calculateLayout(action.width, action.height),
        ready: true,
        resizeKey: state.resizeKey + 1,
      };

    case "accounts_loaded": {
      const allAccount: Account = {
        id: ALL_ACCOUNTS_ID,
        name: "All",
        protocol: "",
        connected: true,
      };
      const accounts = [allAccount, ...action.accounts];
      const newState = { ...state, accounts };
      if (!state.activeAccountId) {
        return { ...newState, activeAccountId: ALL_ACCOUNTS_ID };
      }
      return newState;
    }

    case "account_selected":
      return { ...state, activeAccountId: action.account.id };

    case "chats_loaded": {
      const newState = { ...state, chats: action.chats };
      if (!state.activeChatId && action.chats.length > 0) {
        const first = action.chats[0];
        /* v8 ignore next: defensive guard — length > 0 guarantees element */
        if (first) {
          return {
            ...newState,
            activeChatId: first.id,
            activeChatName: first.name,
          };
        }
      }
      return newState;
    }

    case "chat_selected":
      return {
        ...state,
        activeChatId: action.chat.id,
        activeChatName: action.chat.name,
        focus: PanelFocus.Input,
        prevFocus: state.focus,
      };

    case "chat_previewed":
      return {
        ...state,
        activeChatId: action.chat.id,
        activeChatName: action.chat.name,
      };

    case "messages_loaded":
      return { ...state, messages: action.messages };

    case "send_message":
      return state;

    case "message_sent":
      return state;

    case "toggle_mute": {
      const chats = state.chats.map((chat) =>
        chat.id === action.chatId ? { ...chat, muted: !chat.muted } : chat,
      );
      return { ...state, chats };
    }

    case "toggle_pin": {
      const chats = state.chats.map((chat) =>
        chat.id === action.chatId ? { ...chat, pinned: !chat.pinned } : chat,
      );
      return { ...state, chats };
    }

    case "show_confirm":
      return {
        ...state,
        activePopup: PopupType.Confirm,
        confirmMessage: action.message,
        confirmAction: action.action,
        confirmData: action.data,
        prevFocus: state.focus,
        focus: PanelFocus.Popup,
      };

    case "confirm_result":
      return {
        ...state,
        activePopup: null,
        focus: state.prevFocus,
      };

    case "close_popup":
      return {
        ...state,
        activePopup: null,
        focus: state.prevFocus,
      };

    case "search_result_selected":
      return {
        ...state,
        activePopup: null,
        activeChatId: action.chat.id,
        activeChatName: action.chat.name,
        focus: PanelFocus.Messages,
      };

    case "show_search":
      return {
        ...state,
        activePopup: PopupType.Search,
        prevFocus: state.focus,
        focus: PanelFocus.Popup,
      };

    case "show_help":
      return {
        ...state,
        activePopup: PopupType.Help,
        prevFocus: state.focus,
        focus: PanelFocus.Popup,
      };

    case "show_config":
      return {
        ...state,
        activePopup: PopupType.Config,
        prevFocus: state.focus,
        focus: PanelFocus.Popup,
      };

    case "show_theme":
      return {
        ...state,
        activePopup: PopupType.Theme,
        prevFocus: state.focus,
        focus: PanelFocus.Popup,
      };

    case "theme_selected":
      return {
        ...state,
        activePopup: null,
        focus: state.prevFocus,
      };

    case "reload_config":
      return state;

    case "focus_input":
      return { ...state, focus: PanelFocus.Input, prevFocus: state.focus };

    case "set_focus":
      return { ...state, focus: action.focus, prevFocus: state.focus };

    case "error":
      return {
        ...state,
        errorMessage: action.error,
        errorTime: Date.now(),
        errorDuration: action.duration ?? 0,
      };

    case "archive_chat":
      return state;

    case "chat_action_done":
      return state;

    case "set_input_value":
      return state;
  }
}

/** Return type for the useAppState hook. */
export interface UseAppStateReturn {
  /** Current application state. */
  readonly state: AppState;
  /** Dispatch an action to update state. */
  readonly dispatch: (action: AppAction) => void;
  /** Navigate to the next panel. */
  readonly goNextPanel: () => void;
  /** Navigate to the previous panel. */
  readonly goPrevPanel: () => void;
  /** Navigate to the left panel. */
  readonly goLeftPanel: () => void;
  /** Navigate to the right panel. */
  readonly goRightPanel: () => void;
  /** The poller instance. */
  readonly poller: Poller;
}

/**
 * Custom hook that manages the complete application state.
 * Handles data fetching, polling, and side effects.
 * @param repo - The data repository for fetching accounts, chats, and messages.
 * @returns The application state, dispatch function, and navigation helpers.
 */
export function useAppState(repo: Repository): UseAppStateReturn {
  const [state, dispatch] = useReducer(appReducer, repo.useMock(), createInitialState);
  const pollerRef = useRef(new Poller());
  const poller = pollerRef.current;

  /* Fetch accounts on mount. */
  useEffect(() => {
    repo.fetchAccounts().then(
      (accounts) => {
        dispatch({ type: "accounts_loaded", accounts });
      },
      (err: unknown) => {
        dispatch({ type: "error", error: String(err) });
      },
    );
  }, [repo]);

  /* Fetch chats when active account changes or terminal resizes. */
  useEffect(() => {
    if (!state.activeAccountId) {
      return;
    }

    repo.fetchChats(state.activeAccountId).then(
      (chats) => {
        poller.notifyChatChange(chats.length);
        dispatch({ type: "chats_loaded", chats });
      },
      (err: unknown) => {
        dispatch({ type: "error", error: String(err) });
      },
    );
  }, [repo, state.activeAccountId, poller, state.resizeKey]);

  /* Fetch messages when active chat changes. */
  useEffect(() => {
    if (!state.activeChatId) {
      return;
    }

    repo.fetchMessages(state.activeChatId).then(
      (messages) => {
        poller.notifyMsgChange(messages.length);
        dispatch({ type: "messages_loaded", messages });
      },
      (err: unknown) => {
        dispatch({ type: "error", error: String(err) });
      },
    );
  }, [repo, state.activeChatId, poller]);

  /* Chat polling. */
  useEffect(() => {
    if (!state.activeAccountId) {
      return;
    }

    const interval = poller.chatInterval();
    if (interval === 0) {
      return;
    }

    const timer = setInterval(() => {
      repo.fetchChats(state.activeAccountId).then(
        (chats) => {
          poller.notifyChatChange(chats.length);
          dispatch({ type: "chats_loaded", chats });
        },
        (err: unknown) => {
          dispatch({ type: "error", error: String(err) });
        },
      );
    }, interval);

    return (): void => {
      clearInterval(timer);
    };
  }, [repo, state.activeAccountId, poller]);

  /* Message polling. */
  useEffect(() => {
    if (!state.activeChatId) {
      return;
    }

    const interval = poller.messageInterval();
    if (interval === 0) {
      return;
    }

    const timer = setInterval(() => {
      repo.fetchMessages(state.activeChatId).then(
        (messages) => {
          poller.notifyMsgChange(messages.length);
          dispatch({ type: "messages_loaded", messages });
        },
        (err: unknown) => {
          dispatch({ type: "error", error: String(err) });
        },
      );
    }, interval);

    return (): void => {
      clearInterval(timer);
    };
  }, [repo, state.activeChatId, poller]);

  const goNextPanel = useCallback((): void => {
    dispatch({ type: "set_focus", focus: nextPanel(state.focus) });
  }, [state.focus]);

  const goPrevPanel = useCallback((): void => {
    dispatch({ type: "set_focus", focus: prevPanel(state.focus) });
  }, [state.focus]);

  const goLeftPanel = useCallback((): void => {
    dispatch({ type: "set_focus", focus: leftPanel(state.focus) });
  }, [state.focus]);

  const goRightPanel = useCallback((): void => {
    dispatch({ type: "set_focus", focus: rightPanel(state.focus) });
  }, [state.focus]);

  return {
    state,
    dispatch,
    goNextPanel,
    goPrevPanel,
    goLeftPanel,
    goRightPanel,
    poller,
  };
}

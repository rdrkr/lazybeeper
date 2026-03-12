// Copyright (c) 2026 lazybeeper by Ronen Druker.

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Box, Text, useInput, useStdout } from "ink";
import type { Repository } from "../domain/repository.js";
import { useAppState, PopupType } from "./viewmodel/use-app-state.js";
import { PanelFocus } from "./viewmodel/context.js";
import { ChatAction } from "./viewmodel/messages.js";
import {
  isQuitKey,
  isInterruptKey,
  isTabKey,
  isShiftTabKey,
  isLeftKey,
  isRightKey,
  isUpKey,
  isDownKey,
  isEnterKey,
  isEscapeKey,
  isSearchKey,
  isHelpKey,
  isConfigKey,
  isReloadConfigKey,
  getJumpPanel,
  isTopKey,
  isBottomKey,
  isArchiveKey,
  isMuteKey,
  isPinKey,
  isYesKey,
  isNoKey,
} from "./viewmodel/keys.js";
import type { KeyInfo } from "./viewmodel/keys.js";
import { filterChats } from "./popup/search-popup.js";
import { AccountsPanel } from "./panel/accounts-panel.js";
import { ChatsPanel } from "./panel/chats-panel.js";
import { MessagesPanel } from "./panel/messages-panel.js";
import { InputPanel } from "./panel/input-panel.js";
import { StatusBar } from "./panel/status-bar.js";
import { SearchPopup } from "./popup/search-popup.js";
import { HelpPopup } from "./popup/help-popup.js";
import { ConfirmPopup } from "./popup/confirm-popup.js";
import { ThemePopup, getThemeAtCursor } from "./popup/theme-popup.js";
import { ConfigPopup, CONFIG_ENTRY_COUNT } from "./popup/config-popup.js";
import type { Theme } from "./theme/types.js";
import { ThemeProvider } from "./theme/context.js";
import { resolveTheme } from "./theme/themes.js";
import { getThemeNames } from "./theme/themes.js";
import { readConfigFile, updateConfigFileKey, SelectionMode } from "../domain/config-file.js";

/** Props for the App component. */
interface AppProps {
  /** Data repository for fetching accounts, chats, messages. */
  readonly repo: Repository;
  /** Initial color theme. */
  readonly theme: Theme;
  /** Selection behavior for accounts and chats panels. */
  readonly selectionMode: SelectionMode;
}

/**
 * App is the root Ink component. It handles keyboard routing,
 * manages panel focus, and renders the layout.
 * @param root0 - The component props.
 * @param root0.repo - Data repository for fetching accounts, chats, messages.
 * @param root0.theme - Initial color theme.
 * @param root0.selectionMode - Selection behavior for accounts and chats panels.
 * @returns The rendered App component.
 */
export function App({
  repo,
  theme: initialTheme,
  selectionMode: initialSelectionMode,
}: AppProps): React.ReactElement {
  const { state, dispatch, goNextPanel, goPrevPanel, goLeftPanel, goRightPanel } =
    useAppState(repo);

  /* Theme state: savedTheme persists across popup open/close, activeTheme is for preview. */
  const [savedTheme, setSavedTheme] = useState<Theme>(initialTheme);
  const [activeTheme, setActiveTheme] = useState<Theme>(initialTheme);

  /* Selection mode state. */
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);

  /* Local UI state for cursors and inputs. */
  const [accountsCursor, setAccountsCursor] = useState(0);
  const [chatsCursor, setChatsCursor] = useState(0);
  const [messagesScroll, setMessagesScroll] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [confirmSelected, setConfirmSelected] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCursor, setSearchCursor] = useState(0);
  const [themeCursor, setThemeCursor] = useState(0);
  const [configCursor, setConfigCursor] = useState(0);

  /** Timestamp of last Ctrl-C press for double-press-to-quit. */
  const lastInterruptRef = useRef(0);

  /** Window in milliseconds during which a second Ctrl-C will quit. */
  const INTERRUPT_WINDOW_MS = 3_000;

  const searchFiltered = useMemo(
    () => filterChats(state.chats, searchQuery),
    [state.chats, searchQuery],
  );

  /* Terminal dimensions. */
  const { stdout } = useStdout();
  const termWidth = stdout.columns;
  const termHeight = stdout.rows;

  /* Track previous dimensions to avoid dispatching on every render. */
  const prevDimsRef = useRef({ width: 0, height: 0 });

  /* Ensure layout is updated via effect, not during render. */
  useEffect(() => {
    const prev = prevDimsRef.current;
    if (prev.width !== termWidth || prev.height !== termHeight) {
      prevDimsRef.current = { width: termWidth, height: termHeight };
      dispatch({ type: "resize", width: termWidth, height: termHeight });
    }
  }, [termWidth, termHeight, dispatch]);

  const layout = state.layout;

  /* Handle message sending. */
  const handleSendMessage = useCallback(
    (text: string): void => {
      const trimmed = text.trim();
      if (!trimmed || !state.activeChatId) {
        return;
      }

      setInputValue("");
      repo.sendMessage(state.activeChatId, trimmed).then(
        () => {
          repo.fetchMessages(state.activeChatId).then(
            (messages) => {
              dispatch({ type: "messages_loaded", messages });
            },
            (err: unknown) => {
              dispatch({ type: "error", error: String(err) });
            },
          );
        },
        (err: unknown) => {
          dispatch({ type: "error", error: String(err) });
        },
      );
    },
    [state.activeChatId, repo, dispatch],
  );

  /**
   * Previews a theme at the given cursor index without persisting.
   * @param cursor - The theme cursor index.
   */
  const previewThemeAtCursor = useCallback((cursor: number): void => {
    const name = getThemeAtCursor(cursor);
    if (name) {
      setActiveTheme(resolveTheme(name));
    }
  }, []);

  /**
   * Reloads configuration from the TOML config file.
   */
  const reloadConfig = useCallback((): void => {
    const config = readConfigFile();
    const newTheme = resolveTheme(config.theme);
    setSavedTheme(newTheme);
    setActiveTheme(newTheme);
    setSelectionMode(config.selectionMode);
    dispatch({ type: "error", error: "Configuration reloaded" });
  }, [dispatch]);

  /**
   * Executes the confirm action (e.g., archive/unarchive) after user confirms.
   * @param confirmed - Whether the user confirmed the action.
   */
  const handleConfirmAction = useCallback(
    (confirmed: boolean): void => {
      if (!confirmed) {
        return;
      }

      const archive = state.confirmAction === ChatAction.Archive;
      repo.archiveChat(state.confirmData, archive).then(
        () => {
          if (state.activeAccountId) {
            repo.fetchChats(state.activeAccountId).then(
              (chats) => {
                dispatch({ type: "chats_loaded", chats });
              },
              (err: unknown) => {
                dispatch({ type: "error", error: String(err) });
              },
            );
          }
        },
        (err: unknown) => {
          dispatch({ type: "error", error: String(err) });
        },
      );
    },
    [state.confirmAction, state.confirmData, state.activeAccountId, repo, dispatch],
  );

  /* --- Key handlers (defined before useInput) --- */

  /**
   * Handles keyboard input when the Search popup is active.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  const handleSearchKeys = useCallback(
    (input: string, key: KeyInfo): void => {
      if (isEscapeKey(input, key)) {
        setSearchQuery("");
        setSearchCursor(0);
        dispatch({ type: "close_popup" });
      } else if (isEnterKey(input, key)) {
        if (searchFiltered.length > 0) {
          const selected = searchFiltered[searchCursor];
          if (selected) {
            setSearchQuery("");
            setSearchCursor(0);
            dispatch({ type: "search_result_selected", chat: selected });
          }
        }
      } else if (isDownKey(input, key) || (key.ctrl && input === "n")) {
        if (searchCursor < searchFiltered.length - 1) {
          setSearchCursor(searchCursor + 1);
        }
      } else if (isUpKey(input, key) || (key.ctrl && input === "p")) {
        if (searchCursor > 0) {
          setSearchCursor(searchCursor - 1);
        }
      }
    },
    [searchFiltered, searchCursor, dispatch],
  );

  /**
   * Handles keyboard input when the Help popup is active.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  const handleHelpKeys = useCallback(
    (input: string, key: KeyInfo): void => {
      if (isEscapeKey(input, key) || isHelpKey(input)) {
        dispatch({ type: "close_popup" });
      }
    },
    [dispatch],
  );

  /**
   * Handles keyboard input when the Theme popup is active.
   * Previews theme on cursor move, saves on Enter, reverts on Esc.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  const handleThemeKeys = useCallback(
    (input: string, key: KeyInfo): void => {
      const themeCount = getThemeNames().length;

      if (isEscapeKey(input, key)) {
        setActiveTheme(savedTheme);
        dispatch({ type: "close_popup" });
      } else if (isEnterKey(input, key)) {
        const selected = getThemeAtCursor(themeCursor);
        if (selected) {
          const theme = resolveTheme(selected);
          setSavedTheme(theme);
          setActiveTheme(theme);
          updateConfigFileKey("theme", selected);
          dispatch({ type: "theme_selected", themeName: selected });
        }
      } else if (isDownKey(input, key)) {
        if (themeCursor < themeCount - 1) {
          const next = themeCursor + 1;
          setThemeCursor(next);
          previewThemeAtCursor(next);
        }
      } else if (isUpKey(input, key)) {
        if (themeCursor > 0) {
          const next = themeCursor - 1;
          setThemeCursor(next);
          previewThemeAtCursor(next);
        }
      } else if (isTopKey(input)) {
        setThemeCursor(0);
        previewThemeAtCursor(0);
      } else if (isBottomKey(input)) {
        const last = themeCount - 1;
        setThemeCursor(last);
        previewThemeAtCursor(last);
      }
    },
    [savedTheme, themeCursor, previewThemeAtCursor, dispatch],
  );

  /**
   * Handles keyboard input when the Config popup is active.
   * Navigates config entries, opens sub-popups, or toggles values.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  const handleConfigKeys = useCallback(
    (input: string, key: KeyInfo): void => {
      if (isEscapeKey(input, key)) {
        dispatch({ type: "close_popup" });
      } else if (isDownKey(input, key)) {
        if (configCursor < CONFIG_ENTRY_COUNT - 1) {
          setConfigCursor(configCursor + 1);
        }
      } else if (isUpKey(input, key)) {
        if (configCursor > 0) {
          setConfigCursor(configCursor - 1);
        }
      } else if (isEnterKey(input, key)) {
        if (configCursor === 0) {
          /* Theme entry — open theme popup. */
          const names = getThemeNames();
          const currentIdx = names.findIndex((n) => resolveTheme(n).name === activeTheme.name);
          const startCursor = currentIdx >= 0 ? currentIdx : 0;
          setThemeCursor(startCursor);
          previewThemeAtCursor(startCursor);
          dispatch({ type: "show_theme" });
        } else if (configCursor === 1) {
          /* Selection mode — toggle between navigate and enter. */
          const next =
            selectionMode === SelectionMode.Navigate ? SelectionMode.Enter : SelectionMode.Navigate;
          setSelectionMode(next);
          updateConfigFileKey("selectionMode", next);
        }
      }
    },
    [configCursor, activeTheme.name, selectionMode, previewThemeAtCursor, dispatch],
  );

  /**
   * Handles keyboard input when the Confirm popup is active.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  const handleConfirmKeys = useCallback(
    (input: string, key: KeyInfo): void => {
      if (isEscapeKey(input, key) || isNoKey(input)) {
        setConfirmSelected(1);
        dispatch({ type: "close_popup" });
      } else if (isYesKey(input)) {
        setConfirmSelected(1);
        dispatch({
          type: "confirm_result",
          confirmed: true,
          action: state.confirmAction,
          data: state.confirmData,
        });
        handleConfirmAction(true);
      } else if (isEnterKey(input, key)) {
        const confirmed = confirmSelected === 0;
        setConfirmSelected(1);
        dispatch({
          type: "confirm_result",
          confirmed,
          action: state.confirmAction,
          data: state.confirmData,
        });
        if (confirmed) {
          handleConfirmAction(true);
        }
      } else if (isLeftKey(input) || key.leftArrow) {
        setConfirmSelected(0);
      } else if (isRightKey(input) || key.rightArrow) {
        setConfirmSelected(1);
      }
    },
    [confirmSelected, state.confirmAction, state.confirmData, dispatch, handleConfirmAction],
  );

  /**
   * Handles keyboard input when the Accounts panel is focused.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  /**
   * Selects the account at the given cursor index.
   * @param cursor - The cursor index.
   */
  const selectAccountAtCursor = useCallback(
    (cursor: number): void => {
      const account = state.accounts[cursor];
      if (account) {
        dispatch({ type: "account_selected", account });
      }
    },
    [state.accounts, dispatch],
  );

  /**
   * Handles keyboard input when the Accounts panel is focused.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  const handleAccountsKeys = useCallback(
    (input: string, key: KeyInfo): void => {
      const nav = selectionMode === SelectionMode.Navigate;
      if (isDownKey(input, key) && accountsCursor < state.accounts.length - 1) {
        const next = accountsCursor + 1;
        setAccountsCursor(next);
        if (nav) {
          selectAccountAtCursor(next);
        }
      } else if (isUpKey(input, key) && accountsCursor > 0) {
        const next = accountsCursor - 1;
        setAccountsCursor(next);
        if (nav) {
          selectAccountAtCursor(next);
        }
      } else if (isTopKey(input)) {
        setAccountsCursor(0);
        if (nav) {
          selectAccountAtCursor(0);
        }
      } else if (isBottomKey(input) && state.accounts.length > 0) {
        const last = state.accounts.length - 1;
        setAccountsCursor(last);
        if (nav) {
          selectAccountAtCursor(last);
        }
      } else if (isEnterKey(input, key) && state.accounts.length > 0) {
        selectAccountAtCursor(accountsCursor);
        dispatch({ type: "set_focus", focus: PanelFocus.Chats });
      }
    },
    [accountsCursor, state.accounts, selectionMode, selectAccountAtCursor, dispatch],
  );

  /**
   * Handles keyboard input when the Chats panel is focused.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  /**
   * Selects the chat at the given cursor index.
   * @param cursor - The cursor index.
   */
  const selectChatAtCursor = useCallback(
    (cursor: number): void => {
      const chat = state.chats[cursor];
      if (chat) {
        dispatch({ type: "chat_selected", chat });
      }
    },
    [state.chats, dispatch],
  );

  /**
   * Previews the chat at the given cursor index without changing panel focus.
   * Used in navigate selection mode to show chat content while keeping focus on Chats.
   * @param cursor - The cursor index.
   */
  const previewChatAtCursor = useCallback(
    (cursor: number): void => {
      const chat = state.chats[cursor];
      if (chat) {
        dispatch({ type: "chat_previewed", chat });
      }
    },
    [state.chats, dispatch],
  );

  /**
   * Handles keyboard input when the Chats panel is focused.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  const handleChatsKeys = useCallback(
    (input: string, key: KeyInfo): void => {
      const nav = selectionMode === SelectionMode.Navigate;
      if (isDownKey(input, key) && chatsCursor < state.chats.length - 1) {
        const next = chatsCursor + 1;
        setChatsCursor(next);
        if (nav) {
          previewChatAtCursor(next);
        }
      } else if (isUpKey(input, key) && chatsCursor > 0) {
        const next = chatsCursor - 1;
        setChatsCursor(next);
        if (nav) {
          previewChatAtCursor(next);
        }
      } else if (isTopKey(input)) {
        setChatsCursor(0);
        if (nav) {
          previewChatAtCursor(0);
        }
      } else if (isBottomKey(input) && state.chats.length > 0) {
        const last = state.chats.length - 1;
        setChatsCursor(last);
        if (nav) {
          previewChatAtCursor(last);
        }
      } else if (isEnterKey(input, key) && state.chats.length > 0) {
        selectChatAtCursor(chatsCursor);
      } else if (isArchiveKey(input) && state.chats.length > 0) {
        const chat = state.chats[chatsCursor];
        if (chat) {
          const action = chat.muted ? ChatAction.Unarchive : ChatAction.Archive;
          const label = chat.muted ? "Unarchive" : "Archive";
          dispatch({
            type: "show_confirm",
            message: `${label} chat "${chat.name}"?`,
            action,
            data: chat.id,
          });
        }
      } else if (isMuteKey(input) && state.chats.length > 0) {
        const chat = state.chats[chatsCursor];
        if (chat) {
          dispatch({ type: "toggle_mute", chatId: chat.id });
        }
      } else if (isPinKey(input) && state.chats.length > 0) {
        const chat = state.chats[chatsCursor];
        if (chat) {
          dispatch({ type: "toggle_pin", chatId: chat.id });
        }
      }
    },
    [chatsCursor, state.chats, dispatch, selectionMode, selectChatAtCursor, previewChatAtCursor],
  );

  /**
   * Handles keyboard input when the Messages panel is focused.
   * @param input - The raw input string from the keyboard.
   * @param key - Metadata about the key press.
   */
  const handleMessagesKeys = useCallback(
    (input: string, key: KeyInfo): void => {
      if (isDownKey(input, key)) {
        setMessagesScroll(messagesScroll + 1);
      } else if (isUpKey(input, key)) {
        setMessagesScroll(Math.max(messagesScroll - 1, 0));
      } else if (isTopKey(input)) {
        setMessagesScroll(0);
      } else if (isBottomKey(input)) {
        setMessagesScroll(Number.MAX_SAFE_INTEGER);
      } else if (isEnterKey(input, key)) {
        dispatch({ type: "focus_input" });
      }
    },
    [messagesScroll, dispatch],
  );

  /* Keyboard input handler. */
  useInput((input: string, key: KeyInfo) => {
    /* Route to popup handlers first. */
    if (state.activePopup === PopupType.Search) {
      handleSearchKeys(input, key);
      return;
    }

    if (state.activePopup === PopupType.Help) {
      handleHelpKeys(input, key);
      return;
    }

    if (state.activePopup === PopupType.Confirm) {
      handleConfirmKeys(input, key);
      return;
    }

    if (state.activePopup === PopupType.Theme) {
      handleThemeKeys(input, key);
      return;
    }

    if (state.activePopup === PopupType.Config) {
      handleConfigKeys(input, key);
      return;
    }

    /*
     * When the Input panel is focused, TextInput handles character input.
     * We only intercept Escape and Tab here to avoid double re-renders
     * from both useInput and TextInput processing the same keystroke.
     */
    if (state.focus === PanelFocus.Input) {
      if (isEscapeKey(input, key)) {
        dispatch({ type: "set_focus", focus: PanelFocus.Messages });
        return;
      }
      if (isTabKey(input, key) || isShiftTabKey(input, key)) {
        if (key.shift) {
          goPrevPanel();
        } else {
          goNextPanel();
        }
      }
      return;
    }

    /* Global keys (not in input mode). */
    if (isQuitKey(input)) {
      process.exit(0);
    }

    if (isInterruptKey(input, key)) {
      const now = Date.now();
      if (now - lastInterruptRef.current < INTERRUPT_WINDOW_MS) {
        process.exit(0);
      }
      lastInterruptRef.current = now;
      dispatch({ type: "error", error: "Press Ctrl-C again to quit" });
      return;
    }

    if (isSearchKey(input)) {
      setSearchQuery("");
      setSearchCursor(0);
      dispatch({ type: "show_search" });
      return;
    }

    if (isHelpKey(input)) {
      dispatch({ type: "show_help" });
      return;
    }

    if (isConfigKey(input)) {
      setConfigCursor(0);
      dispatch({ type: "show_config" });
      return;
    }

    if (isReloadConfigKey(input)) {
      reloadConfig();
      return;
    }

    if (isLeftKey(input)) {
      goLeftPanel();
      return;
    }

    if (isRightKey(input)) {
      goRightPanel();
      return;
    }

    const jumpPanel = getJumpPanel(input);
    if (jumpPanel !== null) {
      dispatch({ type: "set_focus", focus: jumpPanel as PanelFocus });
      return;
    }

    if (isTabKey(input, key)) {
      if (key.shift) {
        goPrevPanel();
      } else {
        goNextPanel();
      }
      return;
    }

    if (isShiftTabKey(input, key)) {
      goPrevPanel();
      return;
    }

    /* Panel-specific keys. */
    switch (state.focus) {
      case PanelFocus.Accounts:
        handleAccountsKeys(input, key);
        break;
      case PanelFocus.Chats:
        handleChatsKeys(input, key);
        break;
      case PanelFocus.Messages:
        handleMessagesKeys(input, key);
        break;
    }
  });

  /* --- Render --- */

  if (!state.ready) {
    return (
      <ThemeProvider value={activeTheme}>
        <Text color={activeTheme.textMuted}>Loading lazybeeper...</Text>
      </ThemeProvider>
    );
  }

  /**
   * Renders the active popup as an overlay on top of the main view.
   * @returns The popup element or null if no popup is active.
   */
  function renderPopup(): React.ReactElement | null {
    switch (state.activePopup) {
      case PopupType.Search:
        return (
          <Box position="absolute" marginLeft={0} marginTop={0}>
            <SearchPopup
              chats={state.chats}
              query={searchQuery}
              onQueryChange={setSearchQuery}
              filtered={searchFiltered}
              cursor={searchCursor}
              onSelect={(chat) => {
                dispatch({ type: "search_result_selected", chat });
              }}
              onClose={() => {
                dispatch({ type: "close_popup" });
              }}
              width={layout.totalWidth}
              height={layout.totalHeight}
            />
          </Box>
        );

      case PopupType.Help:
        return (
          <Box position="absolute" marginLeft={0} marginTop={0}>
            <HelpPopup width={layout.totalWidth} height={layout.totalHeight} />
          </Box>
        );

      case PopupType.Confirm:
        return (
          <Box position="absolute" marginLeft={0} marginTop={0}>
            <ConfirmPopup
              message={state.confirmMessage}
              action={state.confirmAction}
              data={state.confirmData}
              selected={confirmSelected}
              onSelectionChange={setConfirmSelected}
              onResult={(confirmed) => {
                dispatch({
                  type: "confirm_result",
                  confirmed,
                  action: state.confirmAction,
                  data: state.confirmData,
                });
                handleConfirmAction(confirmed);
              }}
              width={layout.totalWidth}
              height={layout.totalHeight}
            />
          </Box>
        );

      case PopupType.Theme:
        return (
          <Box position="absolute" marginLeft={0} marginTop={0}>
            <ThemePopup
              cursor={themeCursor}
              activeTheme={activeTheme.name}
              width={layout.totalWidth}
              height={layout.totalHeight}
            />
          </Box>
        );

      case PopupType.Config:
        return (
          <Box position="absolute" marginLeft={0} marginTop={0}>
            <ConfigPopup
              cursor={configCursor}
              currentTheme={activeTheme.name}
              selectionMode={selectionMode}
              width={layout.totalWidth}
              height={layout.totalHeight}
            />
          </Box>
        );

      default:
        return null;
    }
  }

  return (
    <ThemeProvider value={activeTheme}>
      <Box flexDirection="column" width={layout.totalWidth} height={layout.totalHeight}>
        <Box flexDirection="row">
          {/* Sidebar */}
          <Box flexDirection="column" width={layout.sidebarWidth}>
            <AccountsPanel
              accounts={state.accounts}
              focused={state.focus === PanelFocus.Accounts}
              width={layout.sidebarWidth}
              height={layout.accountsHeight}
              cursor={accountsCursor}
            />
            <ChatsPanel
              chats={state.chats}
              focused={state.focus === PanelFocus.Chats}
              width={layout.sidebarWidth}
              height={layout.chatsHeight}
              cursor={chatsCursor}
              top={layout.accountsHeight}
            />
          </Box>
          {/* Main area */}
          <Box flexDirection="column" width={layout.mainWidth}>
            <MessagesPanel
              messages={state.messages}
              chatName={state.activeChatName}
              focused={state.focus === PanelFocus.Messages}
              width={layout.mainWidth}
              height={layout.messagesHeight}
              scrollOffset={messagesScroll}
            />
            <InputPanel
              focused={state.focus === PanelFocus.Input}
              width={layout.mainWidth}
              height={layout.inputHeight}
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSendMessage}
            />
          </Box>
        </Box>
        <StatusBar
          width={layout.totalWidth}
          focus={state.focus}
          chatName={state.activeChatName}
          isMock={state.isMock}
          errorMessage={state.errorMessage}
          errorTime={state.errorTime}
        />
        {renderPopup()}
      </Box>
    </ThemeProvider>
  );
}

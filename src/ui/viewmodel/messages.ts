// Copyright (c) 2026 lazybeeper by Ronen Druker.

import type { Account, Chat, Message } from "../../domain/types.js";

/** Typed enum for chat actions that can be confirmed. */
export enum ChatAction {
  /** Archives a chat. */
  Archive = "archive",
  /** Unarchives a chat. */
  Unarchive = "unarchive",
}

/** Union type for all application actions (equivalent to Go's tea.Msg types). */
export type AppAction =
  | { readonly type: "accounts_loaded"; readonly accounts: Account[] }
  | { readonly type: "account_selected"; readonly account: Account }
  | { readonly type: "chats_loaded"; readonly chats: Chat[] }
  | { readonly type: "chat_selected"; readonly chat: Chat }
  | { readonly type: "chat_previewed"; readonly chat: Chat }
  | { readonly type: "messages_loaded"; readonly messages: Message[] }
  | { readonly type: "send_message"; readonly chatId: string; readonly body: string }
  | { readonly type: "message_sent"; readonly chatId: string }
  | { readonly type: "archive_chat"; readonly chatId: string; readonly archive: boolean }
  | { readonly type: "chat_action_done"; readonly accountId: string }
  | { readonly type: "toggle_mute"; readonly chatId: string }
  | { readonly type: "toggle_pin"; readonly chatId: string }
  | {
      readonly type: "show_confirm";
      readonly message: string;
      readonly action: ChatAction;
      readonly data: string;
    }
  | {
      readonly type: "confirm_result";
      readonly confirmed: boolean;
      readonly action: ChatAction;
      readonly data: string;
    }
  | { readonly type: "close_popup" }
  | { readonly type: "search_result_selected"; readonly chat: Chat }
  | { readonly type: "focus_input" }
  | { readonly type: "set_focus"; readonly focus: import("./context.js").PanelFocus }
  | { readonly type: "resize"; readonly width: number; readonly height: number }
  | { readonly type: "error"; readonly error: string }
  | { readonly type: "show_search" }
  | { readonly type: "show_help" }
  | { readonly type: "show_config" }
  | { readonly type: "show_theme" }
  | { readonly type: "theme_selected"; readonly themeName: string }
  | { readonly type: "reload_config" }
  | { readonly type: "set_input_value"; readonly value: string };

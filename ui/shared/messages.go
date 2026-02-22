// Copyright (c) 2026 lazybeeper by Ronen Druker.

package shared

import "github.com/rdrkr/lazybeeper/domain"

// ChatAction is a typed enum for chat actions that can be confirmed.
type ChatAction int

const (
	// ChatActionArchive archives a chat.
	ChatActionArchive ChatAction = iota
	// ChatActionUnarchive unarchives a chat.
	ChatActionUnarchive
)

// String returns the human-readable name of the chat action.
func (a ChatAction) String() string {
	switch a {
	case ChatActionArchive:
		return "archive"
	case ChatActionUnarchive:
		return "unarchive"
	default:
		return "unknown"
	}
}

// AccountSelectedMsg is sent when a user selects an account.
type AccountSelectedMsg struct {
	// Account is the selected account.
	Account domain.Account
}

// ChatSelectedMsg is sent when a user selects a chat.
type ChatSelectedMsg struct {
	// Chat is the selected chat.
	Chat domain.Chat
}

// AccountsLoadedMsg is sent when accounts have been fetched from the API.
type AccountsLoadedMsg struct {
	// Accounts is the list of loaded accounts.
	Accounts []domain.Account
}

// ChatsLoadedMsg is sent when chats have been loaded for an account.
type ChatsLoadedMsg struct {
	// Chats is the list of loaded chats.
	Chats []domain.Chat
}

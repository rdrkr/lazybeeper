// Copyright (c) 2026 lazybeeper by Ronen Druker.

package shared

// ArchiveChatMsg requests archiving/unarchiving a chat.
type ArchiveChatMsg struct {
	// ChatID is the target chat.
	ChatID string
	// Archive is true to archive, false to unarchive.
	Archive bool
}

// ChatActionDoneMsg signals a chat action completed successfully.
type ChatActionDoneMsg struct {
	// AccountID is the account to refresh chats for.
	AccountID string
}

// ShowConfirmMsg requests the confirm popup to be shown.
type ShowConfirmMsg struct {
	// Message is the question to display.
	Message string
	// Action identifies the action being confirmed.
	Action ChatAction
	// Data carries context (e.g., chat ID).
	Data string
}

// ToggleMuteMsg requests toggling the muted state of a chat.
type ToggleMuteMsg struct {
	// ChatID is the target chat.
	ChatID string
}

// TogglePinMsg requests toggling the pinned state of a chat.
type TogglePinMsg struct {
	// ChatID is the target chat.
	ChatID string
}

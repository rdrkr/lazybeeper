// Copyright (c) 2026 lazybeeper by Ronen Druker.

package shared

import "github.com/rdrkr/lazybeeper/domain"

// MessagesLoadedMsg is sent when messages have been loaded for a chat.
type MessagesLoadedMsg struct {
	// Messages is the list of loaded messages.
	Messages []domain.Message
}

// SendMessageMsg is sent when the user submits a message.
type SendMessageMsg struct {
	// ChatID is the target chat.
	ChatID string
	// Body is the message text.
	Body string
}

// MessageSentMsg is sent after a message has been successfully sent.
type MessageSentMsg struct {
	// ChatID is the chat the message was sent to.
	ChatID string
}

// ErrorMsg carries an error to display in the status bar.
type ErrorMsg struct {
	// Err is the error that occurred.
	Err error
}

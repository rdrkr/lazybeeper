// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package domain defines the core business types for lazybeeper.
// These types are pure Go structs with no external SDK dependencies.
package domain

import (
	"context"
	"time"
)

// Account represents a messaging account (e.g., iMessage, Slack, Signal).
type Account struct {
	// ID is the unique identifier for this account.
	ID string
	// Name is the display name of the account.
	Name string
	// Protocol is the messaging protocol (e.g., "imessage", "slack").
	Protocol string
	// Connected indicates whether the account is currently online.
	Connected bool
}

// Chat represents a conversation thread.
type Chat struct {
	// ID is the unique identifier for this chat.
	ID string
	// AccountID links this chat to its parent account.
	AccountID string
	// Name is the display name of the chat.
	Name string
	// LastMessage is a preview of the most recent message.
	LastMessage string
	// LastMessageTime is when the most recent message was sent.
	LastMessageTime time.Time
	// UnreadCount is the number of unread messages.
	UnreadCount int
	// Pinned indicates if this chat is pinned.
	Pinned bool
	// Muted indicates if notifications are muted.
	Muted bool
}

// Message represents a single message in a chat.
type Message struct {
	// ID is the unique identifier for this message.
	ID string
	// ChatID links this message to its parent chat.
	ChatID string
	// Sender is the display name of the sender.
	Sender string
	// Body is the text content of the message.
	Body string
	// Timestamp is when the message was sent.
	Timestamp time.Time
	// IsFromMe indicates if the current user sent this message.
	IsFromMe bool
}

// Repository defines the interface for data access operations.
type Repository interface {
	// FetchAccounts retrieves the list of connected accounts.
	FetchAccounts(ctx context.Context) ([]Account, error)
	// FetchChats retrieves chats, optionally filtered by account ID.
	FetchChats(ctx context.Context, accountID string) ([]Chat, error)
	// FetchMessages retrieves messages for a chat.
	FetchMessages(ctx context.Context, chatID string) ([]Message, error)
	// SendMessage sends a text message to the specified chat.
	SendMessage(ctx context.Context, chatID, body string) error
	// ArchiveChat archives or unarchives a chat.
	ArchiveChat(ctx context.Context, chatID string, archive bool) error
	// UseMock returns whether the repository is using mock data.
	UseMock() bool
}

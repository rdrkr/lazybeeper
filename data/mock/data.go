// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package mock provides hardcoded test data for development without a live API.
package mock

import (
	"time"

	"github.com/rdrkr/lazybeeper/domain"
)

// Accounts returns hardcoded account data for development.
func Accounts() []domain.Account {
	return []domain.Account{
		{ID: "imessage", Name: "iMessage", Protocol: "imessage", Connected: true},
		{ID: "slack", Name: "Slack", Protocol: "slack", Connected: true},
		{ID: "signal", Name: "Signal", Protocol: "signal", Connected: false},
		{ID: "whatsapp", Name: "WhatsApp", Protocol: "whatsapp", Connected: true},
	}
}

// Chats returns hardcoded chat data for a given account for development.
func Chats(accountID string) []domain.Chat {
	now := time.Now()
	allChats := map[string][]domain.Chat{
		"imessage": {
			{
				ID: "chat1", AccountID: "imessage", Name: "Alice",
				LastMessage: "Want to grab lunch?", LastMessageTime: now.Add(-2 * time.Minute),
				UnreadCount: 2,
			},
			{
				ID: "chat2", AccountID: "imessage", Name: "Bob",
				LastMessage: "See you tomorrow!", LastMessageTime: now.Add(-15 * time.Minute),
				UnreadCount: 0,
			},
			{
				ID: "chat3", AccountID: "imessage", Name: "Family Group",
				LastMessage: "Mom: Happy birthday!", LastMessageTime: now.Add(-1 * time.Hour),
				UnreadCount: 5, Pinned: true,
			},
			{
				ID: "chat4", AccountID: "imessage", Name: "Dave",
				LastMessage: "Thanks for the help", LastMessageTime: now.Add(-3 * time.Hour),
				UnreadCount: 0, Muted: true,
			},
		},
		"slack": {
			{
				ID: "chat5", AccountID: "slack", Name: "#general",
				LastMessage: "Welcome new team members!", LastMessageTime: now.Add(-5 * time.Minute),
				UnreadCount: 12,
			},
			{
				ID: "chat6", AccountID: "slack", Name: "#engineering",
				LastMessage: "Deploy complete", LastMessageTime: now.Add(-30 * time.Minute),
				UnreadCount: 0,
			},
			{
				ID: "chat7", AccountID: "slack", Name: "Carol (DM)",
				LastMessage: "PR looks good", LastMessageTime: now.Add(-45 * time.Minute),
				UnreadCount: 1,
			},
		},
		"signal": {
			{
				ID: "chat8", AccountID: "signal", Name: "Eve",
				LastMessage: "Call me when you can", LastMessageTime: now.Add(-2 * time.Hour),
				UnreadCount: 1,
			},
		},
		"whatsapp": {
			{
				ID: "chat9", AccountID: "whatsapp", Name: "Team Chat",
				LastMessage: "Meeting at 3pm", LastMessageTime: now.Add(-10 * time.Minute),
				UnreadCount: 3,
			},
			{
				ID: "chat10", AccountID: "whatsapp", Name: "Frank",
				LastMessage: "Got it, thanks!", LastMessageTime: now.Add(-4 * time.Hour),
				UnreadCount: 0,
			},
		},
	}

	if chats, ok := allChats[accountID]; ok {
		return chats
	}

	return nil
}

// Messages returns hardcoded message data for a given chat for development.
func Messages(chatID string) []domain.Message {
	now := time.Now()
	allMessages := map[string][]domain.Message{
		"chat1": {
			{
				ID: "m1", ChatID: "chat1", Sender: "Alice",
				Body: "Hey, how are you?", Timestamp: now.Add(-10 * time.Minute),
				IsFromMe: false,
			},
			{
				ID: "m2", ChatID: "chat1", Sender: "You",
				Body: "I'm good, thanks! How about you?", Timestamp: now.Add(-8 * time.Minute),
				IsFromMe: true,
			},
			{
				ID: "m3", ChatID: "chat1", Sender: "Alice",
				Body: "Doing great! Just finished that project.", Timestamp: now.Add(-6 * time.Minute),
				IsFromMe: false,
			},
			{
				ID: "m4", ChatID: "chat1", Sender: "You",
				Body: "Nice! Congrats!", Timestamp: now.Add(-5 * time.Minute),
				IsFromMe: true,
			},
			{
				ID: "m5", ChatID: "chat1", Sender: "Alice",
				Body: "Want to grab lunch?", Timestamp: now.Add(-2 * time.Minute),
				IsFromMe: false,
			},
		},
		"chat2": {
			{
				ID: "m6", ChatID: "chat2", Sender: "Bob",
				Body: "Hey, are we still on for tomorrow?", Timestamp: now.Add(-30 * time.Minute),
				IsFromMe: false,
			},
			{
				ID: "m7", ChatID: "chat2", Sender: "You",
				Body: "Yep, 10am works for me", Timestamp: now.Add(-25 * time.Minute),
				IsFromMe: true,
			},
			{
				ID: "m8", ChatID: "chat2", Sender: "Bob",
				Body: "See you tomorrow!", Timestamp: now.Add(-15 * time.Minute),
				IsFromMe: false,
			},
		},
		"chat5": {
			{
				ID: "m9", ChatID: "chat5", Sender: "Admin",
				Body: "Welcome new team members!", Timestamp: now.Add(-5 * time.Minute),
				IsFromMe: false,
			},
			{
				ID: "m10", ChatID: "chat5", Sender: "You",
				Body: "Welcome everyone!", Timestamp: now.Add(-4 * time.Minute),
				IsFromMe: true,
			},
		},
	}

	if msgs, ok := allMessages[chatID]; ok {
		return msgs
	}

	return []domain.Message{
		{
			ID: "md1", ChatID: chatID, Sender: "Someone",
			Body: "Hello!", Timestamp: now.Add(-1 * time.Hour),
			IsFromMe: false,
		},
		{
			ID: "md2", ChatID: chatID, Sender: "You",
			Body: "Hi there!", Timestamp: now.Add(-55 * time.Minute),
			IsFromMe: true,
		},
	}
}

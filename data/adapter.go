// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package data provides types and client wrappers for the Beeper Desktop API.
package data

import (
	beeperdesktopapi "github.com/beeper/desktop-api-go"
	"github.com/beeper/desktop-api-go/shared"

	"github.com/rdrkr/lazybeeper/domain"
)

// AccountFromAPI converts a Beeper API Account to a domain Account.
func AccountFromAPI(acct beeperdesktopapi.Account) domain.Account {
	name := acct.User.FullName
	if name == "" {
		name = acct.User.Username
	}

	if name == "" {
		name = acct.AccountID
	}

	return domain.Account{
		ID:        acct.AccountID,
		Name:      name,
		Protocol:  acct.AccountID, // accountID often contains the protocol prefix
		Connected: true,           // API only returns connected accounts
	}
}

// ChatFromAPI converts a Beeper API ChatListResponse to a domain Chat.
func ChatFromAPI(resp beeperdesktopapi.ChatListResponse) domain.Chat {
	return domain.Chat{
		ID:              resp.ID,
		AccountID:       resp.AccountID,
		Name:            resp.Title,
		LastMessage:     resp.Preview.Text,
		LastMessageTime: resp.LastActivity,
		UnreadCount:     int(resp.UnreadCount),
		Pinned:          resp.IsPinned,
		Muted:           resp.IsMuted,
	}
}

// MessageFromAPI converts a Beeper API shared.Message to a domain Message.
func MessageFromAPI(msg shared.Message) domain.Message {
	sender := msg.SenderName
	if sender == "" {
		sender = msg.SenderID
	}

	if msg.IsSender {
		sender = "You"
	}

	body := msg.Text
	if body == "" && len(msg.Attachments) > 0 {
		body = "[Attachment]"
	}

	return domain.Message{
		ID:        msg.ID,
		ChatID:    msg.ChatID,
		Sender:    sender,
		Body:      body,
		Timestamp: msg.Timestamp,
		IsFromMe:  msg.IsSender,
	}
}

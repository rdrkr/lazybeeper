// Copyright (c) 2026 lazybeeper by Ronen Druker.

package mock

import (
	"context"

	"github.com/rdrkr/lazybeeper/domain"
)

// Client implements domain.Repository using hardcoded mock data.
type Client struct{}

// NewClient creates a new mock client.
func NewClient() *Client {
	return &Client{}
}

// FetchAccounts returns mock account data.
func (c *Client) FetchAccounts(_ context.Context) ([]domain.Account, error) {
	return Accounts(), nil
}

// FetchChats returns mock chat data for the given account.
func (c *Client) FetchChats(_ context.Context, accountID string) ([]domain.Chat, error) {
	return Chats(accountID), nil
}

// FetchMessages returns mock message data for the given chat.
func (c *Client) FetchMessages(_ context.Context, chatID string) ([]domain.Message, error) {
	return Messages(chatID), nil
}

// SendMessage is a no-op for mock mode.
func (c *Client) SendMessage(_ context.Context, _, _ string) error {
	return nil
}

// ArchiveChat is a no-op for mock mode.
func (c *Client) ArchiveChat(_ context.Context, _ string, _ bool) error {
	return nil
}

// UseMock always returns true for the mock client.
func (c *Client) UseMock() bool {
	return true
}

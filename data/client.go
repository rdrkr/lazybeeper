// Copyright (c) 2026 lazybeeper by Ronen Druker.

package data

import (
	"context"

	beeperdesktopapi "github.com/beeper/desktop-api-go"
	"github.com/beeper/desktop-api-go/option"
	"github.com/beeper/desktop-api-go/packages/param"

	"github.com/rdrkr/lazybeeper/data/mock"
	"github.com/rdrkr/lazybeeper/domain"
	"github.com/rdrkr/lazybeeper/domain/config"
)

// Client wraps the Beeper Desktop API for use by the TUI.
type Client struct {
	cfg     config.Config
	sdk     *beeperdesktopapi.Client
	useMock bool
}

// NewClient creates a new API client with the given configuration.
// If no token is configured, falls back to mock data.
func NewClient(cfg config.Config) *Client {
	client := &Client{cfg: cfg}

	if cfg.Token == "" {
		client.useMock = true

		return client
	}

	var opts []option.RequestOption

	opts = append(opts, option.WithAccessToken(cfg.Token))
	if cfg.BaseURL != "" {
		opts = append(opts, option.WithBaseURL(cfg.BaseURL))
	}

	sdk := beeperdesktopapi.NewClient(opts...)
	client.sdk = &sdk

	return client
}

// UseMock returns whether the client is using mock data.
func (c *Client) UseMock() bool {
	return c.useMock
}

// FetchAccounts retrieves the list of connected accounts.
func (c *Client) FetchAccounts(ctx context.Context) ([]domain.Account, error) {
	if c.useMock {
		return mock.Accounts(), nil
	}

	apiAccounts, err := c.sdk.Accounts.List(ctx)
	if err != nil {
		return nil, err
	}

	var accounts []domain.Account
	for _, acct := range *apiAccounts {
		accounts = append(accounts, AccountFromAPI(acct))
	}

	return accounts, nil
}

// FetchChats retrieves chats, optionally filtered by account ID.
func (c *Client) FetchChats(ctx context.Context, accountID string) ([]domain.Chat, error) {
	if c.useMock {
		return mock.Chats(accountID), nil
	}

	params := beeperdesktopapi.ChatListParams{}
	if accountID != "" {
		params.AccountIDs = []string{accountID}
	}

	page, err := c.sdk.Chats.List(ctx, params)
	if err != nil {
		return nil, err
	}

	var chats []domain.Chat
	for _, item := range page.Items {
		chats = append(chats, ChatFromAPI(item))
	}

	return chats, nil
}

// FetchMessages retrieves messages for a chat.
func (c *Client) FetchMessages(ctx context.Context, chatID string) ([]domain.Message, error) {
	if c.useMock {
		return mock.Messages(chatID), nil
	}

	params := beeperdesktopapi.MessageListParams{}

	page, err := c.sdk.Messages.List(ctx, chatID, params)
	if err != nil {
		return nil, err
	}

	var messages []domain.Message
	for _, msg := range page.Items {
		messages = append(messages, MessageFromAPI(msg))
	}

	// API returns newest first; reverse to show oldest at top.
	for left, right := 0, len(messages)-1; left < right; left, right = left+1, right-1 {
		messages[left], messages[right] = messages[right], messages[left]
	}

	return messages, nil
}

// SendMessage sends a text message to the specified chat.
func (c *Client) SendMessage(ctx context.Context, chatID, text string) error {
	if c.useMock {
		return nil
	}

	_, err := c.sdk.Messages.Send(ctx, chatID, beeperdesktopapi.MessageSendParams{
		Text: param.NewOpt(text),
	})

	return err
}

// ArchiveChat archives or unarchives a chat.
func (c *Client) ArchiveChat(ctx context.Context, chatID string, archive bool) error {
	if c.useMock {
		return nil
	}

	return c.sdk.Chats.Archive(ctx, chatID, beeperdesktopapi.ChatArchiveParams{
		Archived: param.NewOpt(archive),
	})
}

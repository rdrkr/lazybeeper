// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package viewmodel contains business logic extracted from the UI layer.
// It coordinates data fetching, polling, and state management.
package viewmodel

import (
	"context"
	"time"

	tea "charm.land/bubbletea/v2"

	"github.com/rdrkr/lazybeeper/data"
	"github.com/rdrkr/lazybeeper/data/mock"
	"github.com/rdrkr/lazybeeper/domain"
	"github.com/rdrkr/lazybeeper/ui/shared"
)

// AppViewModel holds business state and produces tea.Cmd values
// for data operations. The UI layer delegates to this for all
// non-rendering concerns.
type AppViewModel struct {
	repo   domain.Repository
	poller *data.Poller

	// ActiveAccountID is the currently selected account.
	ActiveAccountID string
	// ActiveChatID is the currently selected chat.
	ActiveChatID string
	// ActiveChatName is the display name of the active chat.
	ActiveChatName string
	// AllChats holds the full chat list for search and mutation.
	AllChats []domain.Chat
}

// NewAppViewModel creates a new AppViewModel with the given repository.
func NewAppViewModel(repo domain.Repository) *AppViewModel {
	return &AppViewModel{
		repo:   repo,
		poller: data.NewPoller(),
	}
}

// Poller returns the polling state manager.
func (vm *AppViewModel) Poller() *data.Poller {
	return vm.poller
}

// IsMock returns whether the repository uses mock data.
func (vm *AppViewModel) IsMock() bool {
	return vm.repo.UseMock()
}

// FetchAccounts returns a command that fetches accounts from the repository.
func (vm *AppViewModel) FetchAccounts() tea.Cmd {
	return func() tea.Msg {
		accounts, err := vm.repo.FetchAccounts(context.Background())
		if err != nil {
			return shared.ErrorMsg{Err: err}
		}

		return shared.AccountsLoadedMsg{Accounts: accounts}
	}
}

// FetchChats returns a command that fetches chats for the given account.
func (vm *AppViewModel) FetchChats(accountID string) tea.Cmd {
	return func() tea.Msg {
		chats, err := vm.repo.FetchChats(context.Background(), accountID)
		if err != nil {
			return shared.ErrorMsg{Err: err}
		}

		return shared.ChatsLoadedMsg{Chats: chats}
	}
}

// FetchMessages returns a command that fetches messages for the given chat.
func (vm *AppViewModel) FetchMessages(chatID string) tea.Cmd {
	return func() tea.Msg {
		msgs, err := vm.repo.FetchMessages(context.Background(), chatID)
		if err != nil {
			return shared.ErrorMsg{Err: err}
		}

		return shared.MessagesLoadedMsg{Messages: msgs}
	}
}

// SendMessage returns a command that sends a message. In mock mode,
// it appends the message to mock data and returns a loaded message.
func (vm *AppViewModel) SendMessage(chatID, body string) tea.Cmd {
	if vm.repo.UseMock() {
		newMsg := domain.Message{
			ID:        "local-" + time.Now().Format("150405"),
			ChatID:    chatID,
			Sender:    "You",
			Body:      body,
			Timestamp: time.Now(),
			IsFromMe:  true,
		}

		return func() tea.Msg {
			mockMsgs := mock.Messages(chatID)

			return shared.MessagesLoadedMsg{Messages: append(mockMsgs, newMsg)}
		}
	}

	return func() tea.Msg {
		err := vm.repo.SendMessage(context.Background(), chatID, body)
		if err != nil {
			return shared.ErrorMsg{Err: err}
		}

		return shared.MessageSentMsg{ChatID: chatID}
	}
}

// ArchiveChat returns a command that archives or unarchives a chat.
func (vm *AppViewModel) ArchiveChat(chatID string, archive bool) tea.Cmd {
	accountID := vm.ActiveAccountID

	return func() tea.Msg {
		err := vm.repo.ArchiveChat(context.Background(), chatID, archive)
		if err != nil {
			return shared.ErrorMsg{Err: err}
		}

		return shared.ChatActionDoneMsg{AccountID: accountID}
	}
}

// HandleTick processes a polling tick and returns the appropriate fetch + reschedule commands.
func (vm *AppViewModel) HandleTick(msg data.TickMsg) tea.Cmd {
	switch msg.Kind {
	case data.ChatTick:
		if vm.ActiveAccountID == "" {
			return vm.poller.ChatTickCmd()
		}

		return tea.Batch(
			vm.FetchChats(vm.ActiveAccountID),
			vm.poller.ChatTickCmd(),
		)
	case data.MessageTick:
		if vm.ActiveChatID == "" {
			return vm.poller.MessageTickCmd()
		}

		return tea.Batch(
			vm.FetchMessages(vm.ActiveChatID),
			vm.poller.MessageTickCmd(),
		)
	}

	return nil
}

// ToggleMute returns a new chat slice with the muted state toggled for the given chat ID.
func (vm *AppViewModel) ToggleMute(chatID string) []domain.Chat {
	result := make([]domain.Chat, len(vm.AllChats))
	copy(result, vm.AllChats)

	for i := range result {
		if result[i].ID == chatID {
			result[i].Muted = !result[i].Muted

			break
		}
	}

	vm.AllChats = result

	return result
}

// TogglePin returns a new chat slice with the pinned state toggled for the given chat ID.
func (vm *AppViewModel) TogglePin(chatID string) []domain.Chat {
	result := make([]domain.Chat, len(vm.AllChats))
	copy(result, vm.AllChats)

	for i := range result {
		if result[i].ID == chatID {
			result[i].Pinned = !result[i].Pinned

			break
		}
	}

	vm.AllChats = result

	return result
}

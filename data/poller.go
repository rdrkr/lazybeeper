// Copyright (c) 2026 lazybeeper by Ronen Druker.

package data

import (
	"time"

	tea "charm.land/bubbletea/v2"
)

// Default polling intervals.
const (
	// ChatPollInterval is how often the chat list is refreshed.
	ChatPollInterval = 5 * time.Second
	// MessagePollInterval is how often the active chat messages are refreshed.
	MessagePollInterval = 3 * time.Second
	// IdleBackoffInterval is the polling interval when no changes are detected.
	IdleBackoffInterval = 15 * time.Second
	// IdleTimeout is how long without changes before polling backs off.
	IdleTimeout = 30 * time.Second
)

// TickMsg signals that a polling tick has fired.
type TickMsg struct {
	// Kind distinguishes chat-list ticks from message ticks.
	Kind TickKind
}

// TickKind identifies the type of polling tick.
type TickKind int

const (
	// ChatTick polls the chat list.
	ChatTick TickKind = iota
	// MessageTick polls the active chat's messages.
	MessageTick
)

// Poller manages polling state and idle backoff logic.
type Poller struct {
	// lastChatChange tracks when the chat list last changed.
	lastChatChange time.Time
	// lastMsgChange tracks when messages last changed.
	lastMsgChange time.Time
	// lastChatCount tracks the previous chat count for diff detection.
	lastChatCount int
	// lastMsgCount tracks the previous message count for diff detection.
	lastMsgCount int
	// enabled controls whether polling is active.
	enabled bool
}

// NewPoller creates a new Poller in the enabled state.
func NewPoller() *Poller {
	now := time.Now()

	return &Poller{
		lastChatChange: now,
		lastMsgChange:  now,
		enabled:        true,
	}
}

// SetEnabled turns polling on or off.
func (p *Poller) SetEnabled(enabled bool) {
	p.enabled = enabled
}

// NotifyChatChange records that the chat list has changed.
func (p *Poller) NotifyChatChange(count int) {
	if count != p.lastChatCount {
		p.lastChatChange = time.Now()
		p.lastChatCount = count
	}
}

// NotifyMsgChange records that the message list has changed.
func (p *Poller) NotifyMsgChange(count int) {
	if count != p.lastMsgCount {
		p.lastMsgChange = time.Now()
		p.lastMsgCount = count
	}
}

// ChatTickCmd returns a tea.Cmd for the next chat poll, using idle backoff.
func (p *Poller) ChatTickCmd() tea.Cmd {
	if !p.enabled {
		return nil
	}

	interval := ChatPollInterval
	if time.Since(p.lastChatChange) > IdleTimeout {
		interval = IdleBackoffInterval
	}

	return tea.Tick(interval, func(time.Time) tea.Msg {
		return TickMsg{Kind: ChatTick}
	})
}

// MessageTickCmd returns a tea.Cmd for the next message poll, using idle backoff.
func (p *Poller) MessageTickCmd() tea.Cmd {
	if !p.enabled {
		return nil
	}

	interval := MessagePollInterval
	if time.Since(p.lastMsgChange) > IdleTimeout {
		interval = IdleBackoffInterval
	}

	return tea.Tick(interval, func(time.Time) tea.Msg {
		return TickMsg{Kind: MessageTick}
	})
}

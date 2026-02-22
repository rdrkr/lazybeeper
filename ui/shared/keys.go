// Copyright (c) 2026 lazybeeper by Ronen Druker.

package shared

import "charm.land/bubbles/v2/key"

// KeyMap defines the global keybindings for the application.
type KeyMap struct {
	// Quit exits the application.
	Quit key.Binding
	// Tab cycles focus to the next panel.
	Tab key.Binding
	// ShiftTab cycles focus to the previous panel.
	ShiftTab key.Binding
	// Left moves focus to the left panel.
	Left key.Binding
	// Right moves focus to the right panel.
	Right key.Binding
	// Up moves the cursor up in a list or viewport.
	Up key.Binding
	// Down moves the cursor down in a list or viewport.
	Down key.Binding
	// Enter confirms a selection or sends a message.
	Enter key.Binding
	// Escape closes a popup or exits the input panel.
	Escape key.Binding
	// Search opens the search popup.
	Search key.Binding
	// Help opens the help popup.
	Help key.Binding
	// Jump1 jumps to the Accounts panel.
	Jump1 key.Binding
	// Jump2 jumps to the Chats panel.
	Jump2 key.Binding
	// Jump3 jumps to the Messages panel.
	Jump3 key.Binding
	// Jump4 jumps to the Input panel.
	Jump4 key.Binding
	// Top jumps to the top of a list.
	Top key.Binding
	// Bottom jumps to the bottom of a list.
	Bottom key.Binding
}

// DefaultKeyMap returns the default keybinding configuration.
func DefaultKeyMap() KeyMap {
	return KeyMap{
		Quit: key.NewBinding(
			key.WithKeys("q", "ctrl+c"),
			key.WithHelp("q/ctrl+c", "quit"),
		),
		Tab: key.NewBinding(
			key.WithKeys("tab"),
			key.WithHelp("tab", "next panel"),
		),
		ShiftTab: key.NewBinding(
			key.WithKeys("shift+tab"),
			key.WithHelp("shift+tab", "prev panel"),
		),
		Left: key.NewBinding(
			key.WithKeys("h"),
			key.WithHelp("h", "left"),
		),
		Right: key.NewBinding(
			key.WithKeys("l"),
			key.WithHelp("l", "right"),
		),
		Up: key.NewBinding(
			key.WithKeys("k", "up"),
			key.WithHelp("k/↑", "up"),
		),
		Down: key.NewBinding(
			key.WithKeys("j", "down"),
			key.WithHelp("j/↓", "down"),
		),
		Enter: key.NewBinding(
			key.WithKeys("enter"),
			key.WithHelp("enter", "select/send"),
		),
		Escape: key.NewBinding(
			key.WithKeys("esc"),
			key.WithHelp("esc", "back/close"),
		),
		Search: key.NewBinding(
			key.WithKeys("/"),
			key.WithHelp("/", "search"),
		),
		Help: key.NewBinding(
			key.WithKeys("?"),
			key.WithHelp("?", "help"),
		),
		Jump1: key.NewBinding(
			key.WithKeys("1"),
			key.WithHelp("1", "accounts"),
		),
		Jump2: key.NewBinding(
			key.WithKeys("2"),
			key.WithHelp("2", "chats"),
		),
		Jump3: key.NewBinding(
			key.WithKeys("3"),
			key.WithHelp("3", "messages"),
		),
		Jump4: key.NewBinding(
			key.WithKeys("4"),
			key.WithHelp("4", "input"),
		),
		Top: key.NewBinding(
			key.WithKeys("g"),
			key.WithHelp("g", "top"),
		),
		Bottom: key.NewBinding(
			key.WithKeys("G"),
			key.WithHelp("G", "bottom"),
		),
	}
}

// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package panel implements the individual UI panels for lazybeeper.
package panel

import tea "charm.land/bubbletea/v2"

// Panel defines the interface that all UI panels must implement.
type Panel interface {
	// Init returns any initial commands for this panel.
	Init() tea.Cmd
	// Update handles incoming messages and returns updated model and commands.
	Update(msg tea.Msg) (Panel, tea.Cmd)
	// View renders the panel as a string.
	View() string
	// SetSize updates the panel's available width and height.
	SetSize(width, height int)
	// Focused returns whether this panel currently has focus.
	Focused() bool
	// SetFocused sets whether this panel has focus.
	SetFocused(isFocused bool)
}

// BasePanel provides shared state for all panels.
type BasePanel struct {
	// width is the current panel width.
	width int
	// height is the current panel height.
	height int
	// focused indicates if this panel has keyboard focus.
	focused bool
}

// SetSize updates the panel dimensions.
func (b *BasePanel) SetSize(width, height int) {
	b.width = width
	b.height = height
}

// Focused returns whether this panel has focus.
func (b *BasePanel) Focused() bool {
	return b.focused
}

// SetFocused sets the focus state.
func (b *BasePanel) SetFocused(isFocused bool) {
	b.focused = isFocused
}

// Width returns the current panel width.
func (b *BasePanel) Width() int {
	return b.width
}

// Height returns the current panel height.
func (b *BasePanel) Height() int {
	return b.height
}

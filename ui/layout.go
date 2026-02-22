// Copyright (c) 2026 lazybeeper by Ronen Druker.

package ui

// Layout holds calculated panel dimensions based on the terminal size.
type Layout struct {
	// TotalWidth is the terminal width.
	TotalWidth int
	// TotalHeight is the terminal height.
	TotalHeight int
	// SidebarWidth is the width of the sidebar column.
	SidebarWidth int
	// MainWidth is the width of the main content area.
	MainWidth int
	// AccountsHeight is the height of the accounts panel.
	AccountsHeight int
	// ChatsHeight is the height of the chats panel.
	ChatsHeight int
	// MessagesHeight is the height of the message viewport.
	MessagesHeight int
	// InputHeight is the height of the input textarea.
	InputHeight int
	// StatusBarHeight is the height of the status bar (always 1).
	StatusBarHeight int
}

// Sidebar width constraints.
const (
	sidebarMinWidth = 25
	sidebarMaxWidth = 40
	sidebarPct      = 30
	inputHeight     = 5
	statusBarHeight = 1
)

// CalculateLayout computes panel dimensions from the total terminal size.
func CalculateLayout(width, height int) Layout {
	lay := Layout{
		TotalWidth:      width,
		TotalHeight:     height,
		StatusBarHeight: statusBarHeight,
	}

	// Sidebar width: 30% clamped to [25, 40].
	sideW := width * sidebarPct / 100
	if sideW < sidebarMinWidth {
		sideW = sidebarMinWidth
	}

	if sideW > sidebarMaxWidth {
		sideW = sidebarMaxWidth
	}

	lay.SidebarWidth = sideW
	lay.MainWidth = width - sideW

	// Vertical layout: subtract status bar.
	usableHeight := height - statusBarHeight
	if usableHeight < 0 {
		usableHeight = 0
	}

	// Sidebar: accounts 30%, chats 70%.
	lay.AccountsHeight = usableHeight * 30 / 100
	if lay.AccountsHeight < 3 {
		lay.AccountsHeight = 3
	}

	lay.ChatsHeight = usableHeight - lay.AccountsHeight

	// Main area: input is fixed, messages get the rest.
	lay.InputHeight = inputHeight
	lay.MessagesHeight = usableHeight - lay.InputHeight

	if lay.MessagesHeight < 3 {
		lay.MessagesHeight = 3
		lay.InputHeight = usableHeight - lay.MessagesHeight

		if lay.InputHeight < 3 {
			lay.InputHeight = 3
		}
	}

	return lay
}

// Copyright (c) 2026 lazybeeper by Ronen Druker.

package shared

// PanelFocus identifies which panel currently has keyboard focus.
type PanelFocus int

const (
	// FocusAccounts is the accounts list panel.
	FocusAccounts PanelFocus = iota
	// FocusChats is the chats list panel.
	FocusChats
	// FocusMessages is the message viewport panel.
	FocusMessages
	// FocusInput is the message input textarea.
	FocusInput
	// FocusPopup is an active popup/overlay.
	FocusPopup
)

// panelCount is the number of navigable panels (excluding popup).
const panelCount = 4

// String returns the human-readable name of the panel focus.
func (f PanelFocus) String() string {
	switch f {
	case FocusAccounts:
		return "Accounts"
	case FocusChats:
		return "Chats"
	case FocusMessages:
		return "Messages"
	case FocusInput:
		return "Input"
	case FocusPopup:
		return "Popup"
	default:
		return "Unknown"
	}
}

// NextPanel returns the next panel in the Tab cycle order.
func (f PanelFocus) NextPanel() PanelFocus {
	if f == FocusPopup {
		return FocusAccounts
	}

	return PanelFocus((int(f) + 1) % panelCount)
}

// PrevPanel returns the previous panel in the Shift+Tab cycle order.
func (f PanelFocus) PrevPanel() PanelFocus {
	if f == FocusPopup {
		return FocusInput
	}

	return PanelFocus((int(f) + panelCount - 1) % panelCount)
}

// RightPanel returns the panel to the right. From sidebar panels,
// moves to messages. From messages/input, stays put.
func (f PanelFocus) RightPanel() PanelFocus {
	switch f {
	case FocusAccounts, FocusChats:
		return FocusMessages
	case FocusMessages, FocusInput, FocusPopup:
		return f
	}

	return f
}

// LeftPanel returns the panel to the left. From main area, moves
// to chats. From sidebar, stays put.
func (f PanelFocus) LeftPanel() PanelFocus {
	switch f {
	case FocusMessages, FocusInput:
		return FocusChats
	case FocusAccounts, FocusChats, FocusPopup:
		return f
	}

	return f
}

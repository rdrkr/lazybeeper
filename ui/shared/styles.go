// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package shared provides types and styles shared across the UI layer.
package shared

import "charm.land/lipgloss/v2"

// Color palette constants.
var (
	// ColorCyan is used for focused panel borders.
	ColorCyan = lipgloss.Color("86")
	// ColorGray is used for unfocused panel borders.
	ColorGray = lipgloss.Color("240")
	// ColorWhite is used for primary text.
	ColorWhite = lipgloss.Color("255")
	// ColorDimWhite is used for secondary text.
	ColorDimWhite = lipgloss.Color("245")
	// ColorGreen is used for connected status and own messages.
	ColorGreen = lipgloss.Color("114")
	// ColorRed is used for disconnected status.
	ColorRed = lipgloss.Color("204")
	// ColorYellow is used for unread indicators.
	ColorYellow = lipgloss.Color("221")
	// ColorBlue is used for message bubbles from others.
	ColorBlue = lipgloss.Color("75")
	// ColorDarkGray is used for timestamps and subtle text.
	ColorDarkGray = lipgloss.Color("238")
	// ColorStatusBar is the background color for the status bar.
	ColorStatusBar = lipgloss.Color("236")
	// ColorBubbleOwn is the background for own message bubbles.
	ColorBubbleOwn = lipgloss.Color("22")
	// ColorBubbleOther is the background for other message bubbles.
	ColorBubbleOther = lipgloss.Color("236")
)

// Styles holds all pre-built Lipgloss styles used in the application.
type Styles struct {
	// FocusedBorder is the border style for the currently active panel.
	FocusedBorder lipgloss.Style
	// UnfocusedBorder is the border style for inactive panels.
	UnfocusedBorder lipgloss.Style
	// Title is the style for panel titles.
	Title lipgloss.Style
	// SelectedItem is the style for the currently selected list item.
	SelectedItem lipgloss.Style
	// NormalItem is the style for non-selected list items.
	NormalItem lipgloss.Style
	// UnreadBadge is the style for unread message count badges.
	UnreadBadge lipgloss.Style
	// UnreadItem is the style for chat items with unread messages.
	UnreadItem lipgloss.Style
	// OwnMessage is the style for messages sent by the current user.
	OwnMessage lipgloss.Style
	// OtherMessage is the style for messages from other users.
	OtherMessage lipgloss.Style
	// OwnBubble is the bubble background style for own messages.
	OwnBubble lipgloss.Style
	// OtherBubble is the bubble background style for other messages.
	OtherBubble lipgloss.Style
	// Timestamp is the style for message timestamps.
	Timestamp lipgloss.Style
	// DateSeparator is the style for date separator lines.
	DateSeparator lipgloss.Style
	// StatusBar is the style for the bottom status bar.
	StatusBar lipgloss.Style
	// StatusBarKey is the style for keybinding hints in the status bar.
	StatusBarKey lipgloss.Style
	// StatusBarMode is the style for the mode/connection indicator.
	StatusBarMode lipgloss.Style
	// ConnectedDot is the style for green connected indicator.
	ConnectedDot lipgloss.Style
	// DisconnectedDot is the style for red disconnected indicator.
	DisconnectedDot lipgloss.Style
	// PinIndicator is the style for the pin icon.
	PinIndicator lipgloss.Style
	// MuteIndicator is the style for the mute icon.
	MuteIndicator lipgloss.Style
}

// DefaultStyles returns the default style configuration.
func DefaultStyles() Styles {
	return Styles{
		FocusedBorder: lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorCyan),
		UnfocusedBorder: lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorGray),
		Title: lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorCyan).
			Padding(0, 1),
		SelectedItem: lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorCyan),
		NormalItem: lipgloss.NewStyle().
			Foreground(ColorDimWhite),
		UnreadBadge: lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorYellow),
		UnreadItem: lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorWhite),
		OwnMessage: lipgloss.NewStyle().
			Foreground(ColorGreen),
		OtherMessage: lipgloss.NewStyle().
			Foreground(ColorBlue),
		OwnBubble: lipgloss.NewStyle().
			Background(ColorBubbleOwn).
			Foreground(ColorWhite).
			Padding(0, 1).
			MarginLeft(2),
		OtherBubble: lipgloss.NewStyle().
			Background(ColorBubbleOther).
			Foreground(ColorWhite).
			Padding(0, 1),
		Timestamp: lipgloss.NewStyle().
			Foreground(ColorDarkGray),
		DateSeparator: lipgloss.NewStyle().
			Foreground(ColorDimWhite).
			Bold(true).
			Align(lipgloss.Center),
		StatusBar: lipgloss.NewStyle().
			Background(ColorStatusBar).
			Foreground(ColorDimWhite).
			Padding(0, 1),
		StatusBarKey: lipgloss.NewStyle().
			Background(ColorStatusBar).
			Foreground(ColorCyan).
			Bold(true),
		StatusBarMode: lipgloss.NewStyle().
			Background(ColorStatusBar).
			Foreground(ColorGreen).
			Bold(true),
		ConnectedDot: lipgloss.NewStyle().
			Foreground(ColorGreen),
		DisconnectedDot: lipgloss.NewStyle().
			Foreground(ColorRed),
		PinIndicator: lipgloss.NewStyle().
			Foreground(ColorYellow),
		MuteIndicator: lipgloss.NewStyle().
			Foreground(ColorDarkGray),
	}
}

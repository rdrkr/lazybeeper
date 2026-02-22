// Copyright (c) 2026 lazybeeper by Ronen Druker.

package panel

import (
	"strings"
	"time"

	"charm.land/lipgloss/v2"

	"github.com/rdrkr/lazybeeper/ui/shared"
)

// ErrorDisplayDuration is how long errors are shown before auto-clearing.
const ErrorDisplayDuration = 10 * time.Second

// StatusBar displays keybinding hints and connection status.
type StatusBar struct {
	styles   shared.Styles
	width    int
	focus    shared.PanelFocus
	errMsg   string
	errTime  time.Time
	chatName string
	isMock   bool
}

// NewStatusBar creates a new status bar.
func NewStatusBar(styles shared.Styles) *StatusBar {
	return &StatusBar{
		styles: styles,
	}
}

// SetWidth sets the status bar width.
func (s *StatusBar) SetWidth(width int) {
	s.width = width
}

// SetFocus updates the displayed focus context.
func (s *StatusBar) SetFocus(focus shared.PanelFocus) {
	s.focus = focus
}

// SetError sets an error message to display with a timestamp.
func (s *StatusBar) SetError(err string) {
	s.errMsg = err
	s.errTime = time.Now()
}

// ClearError removes the error message.
func (s *StatusBar) ClearError() {
	s.errMsg = ""
}

// SetChatName sets the active chat name for display.
func (s *StatusBar) SetChatName(name string) {
	s.chatName = name
}

// SetMockMode sets whether the app is running with mock data.
func (s *StatusBar) SetMockMode(mock bool) {
	s.isMock = mock
}

// View renders the status bar.
func (s *StatusBar) View() string {
	keyStyle := s.styles.StatusBarKey
	barStyle := s.styles.StatusBar

	// Auto-clear old errors.
	if s.errMsg != "" && time.Since(s.errTime) > ErrorDisplayDuration {
		s.errMsg = ""
	}

	// Left: keybinding hints.
	var parts []string

	parts = append(parts, keyStyle.Render("[Tab]")+" switch")
	parts = append(parts, keyStyle.Render("[j/k]")+" navigate")
	parts = append(parts, keyStyle.Render("[/]")+" search")
	parts = append(parts, keyStyle.Render("[?]")+" help")
	parts = append(parts, keyStyle.Render("[q]")+" quit")

	left := strings.Join(parts, "  ")

	// Right: context info.
	var rightParts []string

	// Connection mode.
	if s.isMock {
		rightParts = append(rightParts,
			lipgloss.NewStyle().Background(shared.ColorStatusBar).Foreground(shared.ColorYellow).Bold(true).Render("MOCK"))
	} else {
		rightParts = append(rightParts, s.styles.StatusBarMode.Render("LIVE"))
	}

	// Separator.
	rightParts = append(rightParts,
		lipgloss.NewStyle().Background(shared.ColorStatusBar).Foreground(shared.ColorGray).Render("|"))

	// Chat name or focus.
	if s.chatName != "" {
		rightParts = append(rightParts, s.chatName)
	}

	rightParts = append(rightParts, s.focus.String())

	right := strings.Join(rightParts, " ")

	// Error overrides the right side.
	if s.errMsg != "" {
		errStyle := lipgloss.NewStyle().
			Background(shared.ColorStatusBar).
			Foreground(shared.ColorRed).
			Bold(true)
		right = errStyle.Render("! " + s.errMsg)
	}

	gap := max(s.width-lipgloss.Width(left)-lipgloss.Width(right)-2, 1)

	return barStyle.Width(s.width).Render(
		left + strings.Repeat(" ", gap) + right,
	)
}

// ErrorActive returns true if there is a non-expired error being displayed.
func (s *StatusBar) ErrorActive() bool {
	return s.errMsg != "" && time.Since(s.errTime) <= ErrorDisplayDuration
}

// Copyright (c) 2026 lazybeeper by Ronen Druker.

// Package popup implements overlay dialogs for lazybeeper.
package popup

import (
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/rdrkr/lazybeeper/ui/shared"
)

// Popup defines the interface for overlay dialogs.
type Popup interface {
	// Init returns any initial commands.
	Init() tea.Cmd
	// Update handles incoming messages.
	Update(msg tea.Msg) (Popup, tea.Cmd)
	// View renders the popup overlay.
	View() string
	// Active returns whether this popup is currently visible.
	Active() bool
	// SetSize sets the available area for rendering.
	SetSize(width, height int)
}

// ClosePopupMsg signals that the active popup should be closed.
type ClosePopupMsg struct{}

// overlayStyle returns the border style for popup overlays.
func overlayStyle() lipgloss.Style {
	return lipgloss.NewStyle().
		Border(lipgloss.DoubleBorder()).
		BorderForeground(shared.ColorCyan).
		Padding(1, 2)
}

// centerOverlay places content in a centered box over the terminal.
func centerOverlay(content string, width, height, boxWidth, boxHeight int) string {
	styled := overlayStyle().
		Width(boxWidth).
		Height(boxHeight).
		Render(content)

	// Center vertically.
	lines := strings.Split(styled, "\n")

	padTop := max((height-len(lines))/2, 0)

	var buf strings.Builder
	for range padTop {
		_, _ = buf.WriteString(strings.Repeat(" ", width) + "\n")
	}

	// Center horizontally.
	for _, line := range lines {
		lineWidth := lipgloss.Width(line)

		padLeft := max((width-lineWidth)/2, 0)

		_, _ = buf.WriteString(strings.Repeat(" ", padLeft) + line + "\n")
	}

	return buf.String()
}

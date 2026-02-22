// Copyright (c) 2026 lazybeeper by Ronen Druker.

package popup

import (
	"fmt"
	"strings"

	"charm.land/bubbles/v2/key"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/rdrkr/lazybeeper/ui/shared"
)

// ConfirmResultMsg is sent when the user responds to a confirmation dialog.
type ConfirmResultMsg struct {
	// Confirmed is true if the user selected yes.
	Confirmed bool
	// Action identifies what was being confirmed.
	Action shared.ChatAction
	// Data carries context-specific data (e.g., chat ID).
	Data string
}

// ConfirmPopup shows a yes/no confirmation dialog.
type ConfirmPopup struct {
	active   bool
	width    int
	height   int
	message  string
	action   shared.ChatAction
	data     string
	selected int // 0 = yes, 1 = no
	keys     shared.KeyMap
}

// NewConfirmPopup creates a new confirmation popup.
func NewConfirmPopup() *ConfirmPopup {
	return &ConfirmPopup{
		keys: shared.DefaultKeyMap(),
	}
}

// Init returns no initial commands.
func (p *ConfirmPopup) Init() tea.Cmd { return nil }

// Update handles key events for confirmation.
func (p *ConfirmPopup) Update(msg tea.Msg) (Popup, tea.Cmd) {
	if !p.active {
		return p, nil
	}

	if msg, ok := msg.(tea.KeyPressMsg); ok {
		return p.handleKey(msg)
	}

	return p, nil
}

// handleKey processes key events for the confirm dialog.
func (p *ConfirmPopup) handleKey(msg tea.KeyPressMsg) (Popup, tea.Cmd) {
	switch {
	case key.Matches(msg, p.keys.Escape):
		p.active = false

		return p, func() tea.Msg { return ClosePopupMsg{} }

	case key.Matches(msg, p.keys.Enter):
		return p.handleConfirmEnter()

	case msg.String() == "left" || msg.String() == "h":
		p.selected = 0
	case msg.String() == "right" || msg.String() == "l":
		p.selected = 1
	case msg.String() == "y":
		p.active = false
		action := p.action
		data := p.data

		return p, func() tea.Msg {
			return ConfirmResultMsg{
				Confirmed: true, Action: action, Data: data,
			}
		}
	case msg.String() == "n":
		p.active = false

		return p, func() tea.Msg { return ClosePopupMsg{} }
	default:
		// No matching keybinding.
	}

	return p, nil
}

// handleConfirmEnter processes the enter key to confirm or deny.
func (p *ConfirmPopup) handleConfirmEnter() (Popup, tea.Cmd) {
	p.active = false
	confirmed := p.selected == 0
	action := p.action
	data := p.data

	return p, func() tea.Msg {
		return ConfirmResultMsg{
			Confirmed: confirmed,
			Action:    action,
			Data:      data,
		}
	}
}

// View renders the confirmation popup overlay.
func (p *ConfirmPopup) View() string {
	if !p.active {
		return ""
	}

	titleStyle := lipgloss.NewStyle().Bold(true).Foreground(shared.ColorYellow)
	msgStyle := lipgloss.NewStyle().Foreground(shared.ColorWhite)

	selectedBtn := lipgloss.NewStyle().
		Bold(true).
		Foreground(shared.ColorCyan).
		Background(shared.ColorDarkGray).
		Padding(0, 2)

	normalBtn := lipgloss.NewStyle().
		Foreground(shared.ColorDimWhite).Padding(0, 2)

	dimStyle := lipgloss.NewStyle().Foreground(shared.ColorDarkGray)

	var buf strings.Builder

	_, _ = buf.WriteString(titleStyle.Render("Confirm") + "\n\n")
	_, _ = buf.WriteString(msgStyle.Render(p.message) + "\n\n")

	yesStyle := normalBtn
	noStyle := normalBtn

	if p.selected == 0 {
		yesStyle = selectedBtn
	} else {
		noStyle = selectedBtn
	}

	buttons := fmt.Sprintf(
		"  %s  %s", yesStyle.Render("Yes"), noStyle.Render("No"),
	)

	_, _ = buf.WriteString(buttons + "\n\n")
	_, _ = buf.WriteString(dimStyle.Render("y/n or ←/→ + Enter"))

	boxW := 45
	boxH := 9

	if boxW > p.width-6 {
		boxW = p.width - 6
	}

	return centerOverlay(buf.String(), p.width, p.height, boxW, boxH)
}

// Active returns whether the popup is shown.
func (p *ConfirmPopup) Active() bool { return p.active }

// SetSize sets the available area.
func (p *ConfirmPopup) SetSize(width, height int) {
	p.width = width
	p.height = height
}

// Show activates the confirmation popup.
func (p *ConfirmPopup) Show(message string, action shared.ChatAction, data string) {
	p.active = true
	p.message = message
	p.action = action
	p.data = data
	p.selected = 1 // default to "No" for safety
}

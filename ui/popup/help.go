// Copyright (c) 2026 lazybeeper by Ronen Druker.

package popup

import (
	"strings"

	"charm.land/bubbles/v2/key"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/rdrkr/lazybeeper/ui/shared"
)

// HelpPopup shows keybinding reference.
type HelpPopup struct {
	active bool
	width  int
	height int
	keys   shared.KeyMap
}

// NewHelpPopup creates a new help popup.
func NewHelpPopup() *HelpPopup {
	return &HelpPopup{
		keys: shared.DefaultKeyMap(),
	}
}

// Init returns no initial commands.
func (p *HelpPopup) Init() tea.Cmd { return nil }

// Update handles key events to close the help popup.
func (p *HelpPopup) Update(msg tea.Msg) (Popup, tea.Cmd) {
	if !p.active {
		return p, nil
	}

	if msg, ok := msg.(tea.KeyPressMsg); ok {
		if key.Matches(msg, p.keys.Escape) || key.Matches(msg, p.keys.Help) {
			p.active = false

			return p, func() tea.Msg { return ClosePopupMsg{} }
		}
	}

	return p, nil
}

// View renders the help popup overlay.
func (p *HelpPopup) View() string {
	if !p.active {
		return ""
	}

	content := p.renderHelpContent()

	boxW := 50
	boxH := 28

	if boxW > p.width-6 {
		boxW = p.width - 6
	}

	if boxH > p.height-4 {
		boxH = p.height - 4
	}

	return centerOverlay(content, p.width, p.height, boxW, boxH)
}

// helpBinding pairs a key description with its action.
type helpBinding struct {
	key  string
	desc string
}

// renderHelpContent builds the full help text with all keybinding sections.
func (p *HelpPopup) renderHelpContent() string {
	titleStyle := lipgloss.NewStyle().Bold(true).Foreground(shared.ColorCyan)
	keyStyle := lipgloss.NewStyle().Bold(true).Foreground(shared.ColorYellow)
	descStyle := lipgloss.NewStyle().Foreground(shared.ColorDimWhite)
	sectionStyle := lipgloss.NewStyle().Bold(true).Foreground(shared.ColorGreen).MarginTop(1)

	var buf strings.Builder

	_, _ = buf.WriteString(titleStyle.Render("Keybinding Reference") + "\n\n")

	sections := []struct {
		title    string
		bindings []helpBinding
	}{
		{"Global", []helpBinding{
			{"q / Ctrl+C", "Quit"},
			{"Tab / Shift+Tab", "Cycle panels"},
			{"1-4", "Jump to panel"},
			{"h / l", "Left / right panel"},
			{"/", "Search"},
			{"?", "Help (this popup)"},
		}},
		{"Lists (Accounts / Chats)", []helpBinding{
			{"j / k", "Next / previous"},
			{"g / G", "Top / bottom"},
			{"Enter", "Select"},
		}},
		{"Chats Panel", []helpBinding{
			{"a", "Archive / unarchive"},
			{"m", "Mute / unmute"},
			{"p", "Pin / unpin"},
		}},
		{"Messages", []helpBinding{
			{"j / k", "Scroll down / up"},
			{"g / G", "Top / bottom"},
			{"Enter", "Focus input"},
		}},
		{"Input", []helpBinding{
			{"Enter", "Send message"},
			{"Esc", "Exit to messages"},
		}},
	}

	for _, section := range sections {
		_, _ = buf.WriteString(sectionStyle.Render(section.title) + "\n")

		for _, bind := range section.bindings {
			_, _ = buf.WriteString(
				"  " + keyStyle.Render(bind.key) + "  " + descStyle.Render(bind.desc) + "\n",
			)
		}
	}

	_, _ = buf.WriteString("\n" + descStyle.Render("Press Esc or ? to close"))

	return buf.String()
}

// Active returns whether the popup is shown.
func (p *HelpPopup) Active() bool { return p.active }

// SetSize sets the available area.
func (p *HelpPopup) SetSize(width, height int) {
	p.width = width
	p.height = height
}

// Show activates the help popup.
func (p *HelpPopup) Show() {
	p.active = true
}

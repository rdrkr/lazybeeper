// Copyright (c) 2026 lazybeeper by Ronen Druker.

package popup

import (
	"fmt"
	"strings"

	"charm.land/bubbles/v2/key"
	"charm.land/bubbles/v2/textinput"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/rdrkr/lazybeeper/domain"
	"github.com/rdrkr/lazybeeper/ui/shared"
)

// SearchResultSelectedMsg is sent when a user selects a search result.
type SearchResultSelectedMsg struct {
	// Chat is the selected chat from search results.
	Chat domain.Chat
}

// SearchPopup provides a chat search overlay.
type SearchPopup struct {
	active   bool
	width    int
	height   int
	input    textinput.Model
	chats    []domain.Chat
	filtered []domain.Chat
	cursor   int
	styles   shared.Styles
	keys     shared.KeyMap
}

// NewSearchPopup creates a new search popup.
func NewSearchPopup(styles shared.Styles) *SearchPopup {
	searchInput := textinput.New()
	searchInput.Placeholder = "Search chats..."
	searchInput.CharLimit = 100
	searchInput.SetWidth(40)

	return &SearchPopup{
		input:  searchInput,
		styles: styles,
		keys:   shared.DefaultKeyMap(),
	}
}

// Init returns no initial commands.
func (p *SearchPopup) Init() tea.Cmd { return nil }

// Update handles key events for search navigation.
func (p *SearchPopup) Update(msg tea.Msg) (Popup, tea.Cmd) {
	if !p.active {
		return p, nil
	}

	if msg, ok := msg.(tea.KeyPressMsg); ok {
		if cmd := p.handleKey(msg); cmd != nil {
			return p, cmd
		}
	}

	// Update the text input.
	var cmd tea.Cmd

	p.input, cmd = p.input.Update(msg)

	// Re-filter on every keystroke.
	p.filterChats()

	return p, cmd
}

// handleKey processes key events for search navigation. Returns a command
// if the key was consumed, or nil to fall through to textinput update.
func (p *SearchPopup) handleKey(msg tea.KeyPressMsg) tea.Cmd {
	switch {
	case key.Matches(msg, p.keys.Escape):
		return p.handleClose()
	case key.Matches(msg, p.keys.Enter):
		return p.handleSelect()
	case msg.String() == "down" || msg.String() == "ctrl+n":
		if p.cursor < len(p.filtered)-1 {
			p.cursor++
		}

		return noopCmd
	case msg.String() == "up" || msg.String() == "ctrl+p":
		if p.cursor > 0 {
			p.cursor--
		}

		return noopCmd
	default:
		return nil
	}
}

// noopCmd returns a sentinel command indicating the key was consumed.
func noopCmd() tea.Msg { return nil }

// handleClose closes the search popup and resets state.
func (p *SearchPopup) handleClose() tea.Cmd {
	p.active = false
	p.input.Reset()
	p.filtered = nil
	p.cursor = 0

	return func() tea.Msg { return ClosePopupMsg{} }
}

// handleSelect processes the enter key to select a search result.
func (p *SearchPopup) handleSelect() tea.Cmd {
	if len(p.filtered) == 0 || p.cursor >= len(p.filtered) {
		return noopCmd
	}

	selected := p.filtered[p.cursor]
	p.active = false
	p.input.Reset()
	p.filtered = nil
	p.cursor = 0

	return func() tea.Msg {
		return SearchResultSelectedMsg{Chat: selected}
	}
}

// filterChats filters the chat list based on the current input value.
func (p *SearchPopup) filterChats() {
	query := strings.ToLower(strings.TrimSpace(p.input.Value()))
	if query == "" {
		p.filtered = p.chats
		p.clampCursor()

		return
	}

	p.filtered = nil

	for _, chat := range p.chats {
		nameMatch := strings.Contains(strings.ToLower(chat.Name), query)
		msgMatch := strings.Contains(strings.ToLower(chat.LastMessage), query)

		if nameMatch || msgMatch {
			p.filtered = append(p.filtered, chat)
		}
	}

	p.clampCursor()
}

// clampCursor ensures the cursor is within filtered results bounds.
func (p *SearchPopup) clampCursor() {
	if p.cursor >= len(p.filtered) {
		p.cursor = max(0, len(p.filtered)-1)
	}
}

// View renders the search popup overlay.
func (p *SearchPopup) View() string {
	if !p.active {
		return ""
	}

	content := p.renderSearchContent()

	boxW := 50
	boxH := 18

	if boxW > p.width-6 {
		boxW = p.width - 6
	}

	if boxH > p.height-4 {
		boxH = p.height - 4
	}

	return centerOverlay(content, p.width, p.height, boxW, boxH)
}

// renderSearchContent builds the search popup body text.
func (p *SearchPopup) renderSearchContent() string {
	titleStyle := lipgloss.NewStyle().Bold(true).Foreground(shared.ColorCyan)
	selectedStyle := lipgloss.NewStyle().Bold(true).Foreground(shared.ColorCyan)
	normalStyle := lipgloss.NewStyle().Foreground(shared.ColorDimWhite)
	dimStyle := lipgloss.NewStyle().Foreground(shared.ColorDarkGray)

	var buf strings.Builder

	_, _ = buf.WriteString(titleStyle.Render("Search Chats") + "\n\n")
	_, _ = buf.WriteString(p.input.View() + "\n\n")

	maxResults := 10

	if len(p.filtered) == 0 {
		_, _ = buf.WriteString(dimStyle.Render("  No results"))
	} else {
		for idx, chat := range p.filtered {
			if idx >= maxResults {
				_, _ = buf.WriteString(dimStyle.Render(
					fmt.Sprintf("  ... and %d more", len(p.filtered)-maxResults),
				))

				break
			}

			indicator := "  "
			style := normalStyle

			if idx == p.cursor {
				indicator = "> "
				style = selectedStyle
			}

			line := fmt.Sprintf("%s%s", indicator, chat.Name)
			if chat.UnreadCount > 0 {
				line += fmt.Sprintf(" (%d)", chat.UnreadCount)
			}

			_, _ = buf.WriteString(style.Render(line) + "\n")
		}
	}

	_, _ = buf.WriteString(
		"\n" + dimStyle.Render("Enter: select  Esc: close  ↑/↓: navigate"),
	)

	return buf.String()
}

// Active returns whether the popup is shown.
func (p *SearchPopup) Active() bool { return p.active }

// SetSize sets the available area.
func (p *SearchPopup) SetSize(width, height int) {
	p.width = width
	p.height = height
}

// Show activates the search popup with the given chats to search.
func (p *SearchPopup) Show(chats []domain.Chat) {
	p.active = true
	p.chats = chats
	p.filtered = chats
	p.cursor = 0
	p.input.Reset()
	p.input.Focus()
}

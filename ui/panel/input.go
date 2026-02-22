// Copyright (c) 2026 lazybeeper by Ronen Druker.

package panel

import (
	"strings"

	"charm.land/bubbles/v2/key"
	"charm.land/bubbles/v2/textarea"
	tea "charm.land/bubbletea/v2"

	"github.com/rdrkr/lazybeeper/ui/shared"
)

// InputPanel provides a textarea for composing messages.
type InputPanel struct {
	BasePanel

	textarea textarea.Model
	chatID   string
	styles   shared.Styles
	keys     shared.KeyMap
}

// NewInputPanel creates a new input panel.
func NewInputPanel(styles shared.Styles) *InputPanel {
	input := textarea.New()
	input.Placeholder = "Type a message..."
	input.CharLimit = 4096
	input.SetHeight(3)
	input.ShowLineNumbers = false
	inputStyles := input.Styles()
	inputStyles.Focused.CursorLine = inputStyles.Focused.CursorLine.UnsetBackground()
	input.SetStyles(inputStyles)

	return &InputPanel{
		textarea: input,
		styles:   styles,
		keys:     shared.DefaultKeyMap(),
	}
}

// Init returns no initial commands.
func (p *InputPanel) Init() tea.Cmd {
	return nil
}

// Update handles key events for message composition.
func (p *InputPanel) Update(msg tea.Msg) (Panel, tea.Cmd) {
	if !p.focused {
		return p, nil
	}

	if msg, ok := msg.(tea.KeyPressMsg); ok {
		switch {
		case key.Matches(msg, p.keys.Escape):
			return p, nil
		case key.Matches(msg, p.keys.Enter):
			return p.handleEnter()
		default:
			// Fall through to textarea update.
		}
	}

	var cmd tea.Cmd

	p.textarea, cmd = p.textarea.Update(msg)

	return p, cmd
}

// handleEnter processes the enter key to send a message.
func (p *InputPanel) handleEnter() (Panel, tea.Cmd) {
	text := strings.TrimSpace(p.textarea.Value())
	if text != "" && p.chatID != "" {
		p.textarea.Reset()

		return p, func() tea.Msg {
			return shared.SendMessageMsg{
				ChatID: p.chatID,
				Body:   text,
			}
		}
	}

	return p, nil
}

// View renders the input textarea.
func (p *InputPanel) View() string {
	innerWidth := p.width - 2
	innerHeight := p.height - 2

	if innerWidth < 0 {
		innerWidth = 0
	}

	if innerHeight < 0 {
		innerHeight = 0
	}

	p.textarea.SetWidth(innerWidth)
	p.textarea.SetHeight(max(innerHeight-1, 1))

	title := p.styles.Title.Render("Input [4]")
	content := title + "\n" + p.textarea.View()

	borderStyle := p.styles.UnfocusedBorder
	if p.focused {
		borderStyle = p.styles.FocusedBorder
	}

	return borderStyle.
		Width(p.width).
		Height(p.height).
		Render(content)
}

// SetChatID sets the active chat for sending messages.
func (p *InputPanel) SetChatID(chatID string) {
	p.chatID = chatID
}

// SetFocused overrides BasePanel to also focus/blur the textarea.
func (p *InputPanel) SetFocused(isFocused bool) {
	p.BasePanel.SetFocused(isFocused)

	if isFocused {
		p.textarea.Focus()
	} else {
		p.textarea.Blur()
	}
}

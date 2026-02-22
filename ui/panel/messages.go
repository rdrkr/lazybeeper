// Copyright (c) 2026 lazybeeper by Ronen Druker.

package panel

import (
	"fmt"
	"strings"

	"charm.land/bubbles/v2/key"
	"charm.land/bubbles/v2/viewport"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/rdrkr/lazybeeper/domain"
	"github.com/rdrkr/lazybeeper/domain/textutil"
	"github.com/rdrkr/lazybeeper/ui/shared"
)

// MessagesPanel displays messages in a scrollable viewport.
type MessagesPanel struct {
	BasePanel

	messages []domain.Message
	chatName string
	viewport viewport.Model
	styles   shared.Styles
	keys     shared.KeyMap
	ready    bool
}

// NewMessagesPanel creates a new messages panel.
func NewMessagesPanel(styles shared.Styles) *MessagesPanel {
	return &MessagesPanel{
		styles: styles,
		keys:   shared.DefaultKeyMap(),
	}
}

// Init returns no initial commands.
func (p *MessagesPanel) Init() tea.Cmd {
	return nil
}

// Update handles key and mouse events for message scrolling.
func (p *MessagesPanel) Update(msg tea.Msg) (Panel, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		return p.handleKey(msg)
	case tea.MouseMsg:
		return p.handleMouse(msg)
	default:
		// No-op for unrecognised message types.
	}

	return p, nil
}

// handleKey processes key events for message scrolling.
func (p *MessagesPanel) handleKey(msg tea.KeyPressMsg) (Panel, tea.Cmd) {
	if !p.focused {
		return p, nil
	}

	switch {
	case key.Matches(msg, p.keys.Down):
		p.viewport.ScrollDown(1)
	case key.Matches(msg, p.keys.Up):
		p.viewport.ScrollUp(1)
	case key.Matches(msg, p.keys.Top):
		p.viewport.GotoTop()
	case key.Matches(msg, p.keys.Bottom):
		p.viewport.GotoBottom()
	case key.Matches(msg, p.keys.Enter):
		return p, func() tea.Msg {
			return FocusInputMsg{}
		}
	default:
		// No matching keybinding.
	}

	return p, nil
}

// handleMouse processes mouse events for message scrolling.
func (p *MessagesPanel) handleMouse(msg tea.MouseMsg) (Panel, tea.Cmd) {
	if !p.ready {
		return p, nil
	}

	var cmd tea.Cmd

	p.viewport, cmd = p.viewport.Update(msg)

	return p, cmd
}

// FocusInputMsg requests focus be moved to the input panel.
type FocusInputMsg struct{}

// View renders the messages viewport with bubbles and date separators.
func (p *MessagesPanel) View() string {
	innerWidth := p.width - 2
	innerHeight := p.height - 2

	if innerWidth < 0 {
		innerWidth = 0
	}

	if innerHeight < 0 {
		innerHeight = 0
	}

	title := p.renderTitle()
	content := p.renderMessages(innerWidth)

	vpHeight := max(innerHeight-1, 1)

	p.updateViewport(innerWidth, vpHeight, content)

	full := title + "\n" + p.viewport.View()

	borderStyle := p.styles.UnfocusedBorder
	if p.focused {
		borderStyle = p.styles.FocusedBorder
	}

	return borderStyle.
		Width(p.width).
		Height(p.height).
		Render(full)
}

// renderTitle renders the title bar for the messages panel.
func (p *MessagesPanel) renderTitle() string {
	titleText := "Messages [3]"
	if p.chatName != "" {
		titleText = p.chatName + " - [3]"
	}

	return p.styles.Title.Render(titleText)
}

// updateViewport initialises or updates the viewport with new content.
func (p *MessagesPanel) updateViewport(vpWidth, vpHeight int, content string) {
	if !p.ready || p.viewport.Width() != vpWidth || p.viewport.Height() != vpHeight {
		p.viewport = viewport.New(
			viewport.WithWidth(vpWidth), viewport.WithHeight(vpHeight),
		)
		p.viewport.SetContent(content)
		p.viewport.GotoBottom()
		p.ready = true

		return
	}

	// Track if user was at bottom before update.
	wasAtBottom := p.viewport.AtBottom()
	p.viewport.SetWidth(vpWidth)
	p.viewport.SetHeight(vpHeight)
	p.viewport.SetContent(content)

	if wasAtBottom {
		p.viewport.GotoBottom()
	}
}

// renderMessages builds the full message content with bubbles and date separators.
func (p *MessagesPanel) renderMessages(viewWidth int) string {
	if len(p.messages) == 0 {
		return p.styles.NormalItem.Render("  No messages. Select a chat to view messages.")
	}

	// Max bubble width is ~60% of the view.
	maxBubbleWidth := max(viewWidth*60/100, 20)

	var lines []string

	for i, msg := range p.messages {
		// Insert date separator when the day changes.
		if i == 0 || !textutil.SameDay(p.messages[i-1].Timestamp, msg.Timestamp) {
			label := textutil.DateLabel(msg.Timestamp)
			lines = append(lines, p.renderDateSepFromLabel(label, viewWidth))
		}

		lines = append(lines, p.renderBubble(msg, viewWidth, maxBubbleWidth))
	}

	return strings.Join(lines, "\n")
}

// renderDateSepFromLabel renders a centered date separator line.
func (p *MessagesPanel) renderDateSepFromLabel(label string, viewWidth int) string {
	labelLen := len(label)

	dashCount := max((viewWidth-labelLen-4)/2, 1)

	dashes := strings.Repeat("\u2500", dashCount)
	line := fmt.Sprintf("%s %s %s", dashes, label, dashes)

	return p.styles.DateSeparator.Width(viewWidth).Render(line)
}

// renderBubble renders a single message as a styled bubble.
func (p *MessagesPanel) renderBubble(msg domain.Message, viewWidth, maxBubbleWidth int) string {
	timeStr := textutil.FormatTime(msg.Timestamp)

	// Wrap body text to bubble width.
	bodyWidth := max(
		// padding
		maxBubbleWidth-2, 10)

	wrappedBody := textutil.WrapText(msg.Body, bodyWidth)

	if msg.IsFromMe {
		return p.renderOwnBubble(wrappedBody, timeStr, viewWidth, maxBubbleWidth)
	}

	return p.renderOtherBubble(msg.Sender, wrappedBody, timeStr, maxBubbleWidth)
}

// renderOwnBubble renders a right-aligned green bubble for own messages.
func (p *MessagesPanel) renderOwnBubble(body, timeStr string, viewWidth, maxBubbleWidth int) string {
	sender := p.styles.OwnMessage.Render("You")
	header := fmt.Sprintf("%s  %s", sender, p.styles.Timestamp.Render(timeStr))

	bubble := p.styles.OwnBubble.
		MaxWidth(maxBubbleWidth).
		Render(body)

	// Right-align by padding from the left.
	bubbleWidth := lipgloss.Width(bubble)

	padLeft := max(viewWidth-bubbleWidth, 0)

	headerWidth := lipgloss.Width(header)

	headerPad := max(viewWidth-headerWidth, 0)

	return strings.Repeat(" ", headerPad) + header + "\n" +
		strings.Repeat(" ", padLeft) + bubble
}

// renderOtherBubble renders a left-aligned blue bubble for other messages.
func (p *MessagesPanel) renderOtherBubble(senderName, body, timeStr string, maxBubbleWidth int) string {
	sender := p.styles.OtherMessage.Render(senderName)
	header := fmt.Sprintf("%s  %s", sender, p.styles.Timestamp.Render(timeStr))

	bubble := p.styles.OtherBubble.
		MaxWidth(maxBubbleWidth).
		Render(body)

	return header + "\n" + bubble
}

// SetMessages updates the displayed messages and chat name.
func (p *MessagesPanel) SetMessages(messages []domain.Message, chatName string) {
	p.messages = messages
	p.chatName = chatName
	p.ready = false
}

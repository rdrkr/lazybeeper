// Copyright (c) 2026 lazybeeper by Ronen Druker.

package panel

import (
	"fmt"
	"strings"

	"charm.land/bubbles/v2/key"
	tea "charm.land/bubbletea/v2"

	"github.com/rdrkr/lazybeeper/domain"
	"github.com/rdrkr/lazybeeper/domain/textutil"
	"github.com/rdrkr/lazybeeper/ui/shared"
)

// linesPerChat is how many rendered lines each chat entry takes.
const linesPerChat = 2

// ChatsPanel displays the list of chats for the selected account.
type ChatsPanel struct {
	BasePanel

	chats  []domain.Chat
	cursor int
	offset int // scroll offset for long lists
	styles shared.Styles
	keys   shared.KeyMap
}

// NewChatsPanel creates a new chats panel.
func NewChatsPanel(styles shared.Styles) *ChatsPanel {
	return &ChatsPanel{
		styles: styles,
		keys:   shared.DefaultKeyMap(),
	}
}

// Init returns no initial commands.
func (p *ChatsPanel) Init() tea.Cmd {
	return nil
}

// visibleSlots returns how many chat entries can be shown at once.
func (p *ChatsPanel) visibleSlots() int {
	innerHeight := p.height - 2 // border

	usable := innerHeight - 1 // title line

	// Reserve a line for the scroll indicator when scrolling is needed.
	if len(p.chats)*linesPerChat > usable {
		usable--
	}

	if usable < linesPerChat {
		return 1
	}

	return usable / linesPerChat
}

// clampOffset ensures cursor is visible within the scroll window.
func (p *ChatsPanel) clampOffset() {
	slots := p.visibleSlots()

	if p.cursor < p.offset {
		p.offset = p.cursor
	}

	if p.cursor >= p.offset+slots {
		p.offset = p.cursor - slots + 1
	}

	if p.offset < 0 {
		p.offset = 0
	}
}

// Update handles key and mouse events for chat navigation.
func (p *ChatsPanel) Update(msg tea.Msg) (Panel, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		return p.handleKey(msg)
	case tea.MouseClickMsg:
		return p.handleMouseClick(msg)
	default:
		// No-op for unrecognised message types.
	}

	return p, nil
}

// handleKey processes key events for chat navigation.
func (p *ChatsPanel) handleKey(msg tea.KeyPressMsg) (Panel, tea.Cmd) {
	if !p.focused {
		return p, nil
	}

	switch {
	case key.Matches(msg, p.keys.Down):
		if p.cursor < len(p.chats)-1 {
			p.cursor++
			p.clampOffset()
		}
	case key.Matches(msg, p.keys.Up):
		if p.cursor > 0 {
			p.cursor--
			p.clampOffset()
		}
	case key.Matches(msg, p.keys.Enter):
		if len(p.chats) > 0 {
			return p, func() tea.Msg {
				return shared.ChatSelectedMsg{Chat: p.chats[p.cursor]}
			}
		}
	case key.Matches(msg, p.keys.Top):
		p.cursor = 0
		p.clampOffset()
	case key.Matches(msg, p.keys.Bottom):
		if len(p.chats) > 0 {
			p.cursor = len(p.chats) - 1
			p.clampOffset()
		}
	case msg.String() == "a":
		return p.handleArchiveKey()
	case msg.String() == "m":
		return p.handleMuteKey()
	case msg.String() == "p":
		return p.handlePinKey()
	default:
		// No matching keybinding.
	}

	return p, nil
}

// handleArchiveKey processes the archive/unarchive keybinding.
func (p *ChatsPanel) handleArchiveKey() (Panel, tea.Cmd) {
	if len(p.chats) == 0 {
		return p, nil
	}

	chat := p.chats[p.cursor]
	action := shared.ChatActionArchive
	label := "Archive"

	if chat.Muted {
		action = shared.ChatActionUnarchive
		label = "Unarchive"
	}

	return p, func() tea.Msg {
		return shared.ShowConfirmMsg{
			Message: label + " chat \"" + chat.Name + "\"?",
			Action:  action,
			Data:    chat.ID,
		}
	}
}

// handleMuteKey processes the mute/unmute keybinding.
func (p *ChatsPanel) handleMuteKey() (Panel, tea.Cmd) {
	if len(p.chats) == 0 {
		return p, nil
	}

	chatID := p.chats[p.cursor].ID

	return p, func() tea.Msg {
		return shared.ToggleMuteMsg{ChatID: chatID}
	}
}

// handlePinKey processes the pin/unpin keybinding.
func (p *ChatsPanel) handlePinKey() (Panel, tea.Cmd) {
	if len(p.chats) == 0 {
		return p, nil
	}

	chatID := p.chats[p.cursor].ID

	return p, func() tea.Msg {
		return shared.TogglePinMsg{ChatID: chatID}
	}
}

// handleMouseClick processes mouse click events for chat selection.
func (p *ChatsPanel) handleMouseClick(msg tea.MouseClickMsg) (Panel, tea.Cmd) {
	if msg.Button == tea.MouseLeft {
		// Determine which chat was clicked based on Y offset.
		// Title is line 0, each chat occupies linesPerChat lines.
		innerY := msg.Y - 1 // account for border

		chatLine := innerY - 1 // account for title
		if chatLine >= 0 {
			idx := p.offset + chatLine/linesPerChat
			if idx >= 0 && idx < len(p.chats) {
				p.cursor = idx

				return p, func() tea.Msg {
					return shared.ChatSelectedMsg{Chat: p.chats[p.cursor]}
				}
			}
		}
	}

	return p, nil
}

// View renders the chats list with scroll offset.
func (p *ChatsPanel) View() string {
	innerWidth := p.width - 2
	innerHeight := p.height - 2

	if innerWidth < 0 {
		innerWidth = 0
	}

	if innerHeight < 0 {
		innerHeight = 0
	}

	title := p.styles.Title.Render("Chats [2]")

	var lines []string

	lines = append(lines, title)

	slots := p.visibleSlots()

	end := min(p.offset+slots, len(p.chats))

	visible := p.chats[p.offset:end]
	for visIdx, chat := range visible {
		idx := p.offset + visIdx

		chatLines := p.renderChatEntry(idx, chat, innerWidth)
		lines = append(lines, chatLines...)
	}

	if len(p.chats) == 0 {
		lines = append(lines, p.styles.NormalItem.Render("   No chats"))
	}

	// Scroll indicator.
	if len(p.chats) > slots {
		indicator := fmt.Sprintf(
			"   [%d-%d of %d]",
			p.offset+1, end, len(p.chats),
		)
		lines = append(lines, p.styles.Timestamp.Render(indicator))
	}

	content := strings.Join(lines, "\n")

	contentLines := strings.Count(content, "\n") + 1

	var contentSb strings.Builder

	for contentLines < innerHeight {
		_, _ = contentSb.WriteString("\n")

		contentLines++
	}

	content += contentSb.String()

	borderStyle := p.styles.UnfocusedBorder
	if p.focused {
		borderStyle = p.styles.FocusedBorder
	}

	return borderStyle.
		Width(p.width).
		Height(p.height).
		Render(content)
}

// renderChatEntry renders a single chat entry as two lines (name + preview).
func (p *ChatsPanel) renderChatEntry(idx int, chat domain.Chat, innerWidth int) []string {
	indicators := ""
	if chat.Pinned {
		indicators += p.styles.PinIndicator.Render(" *")
	}

	if chat.Muted {
		indicators += p.styles.MuteIndicator.Render(" ~")
	}

	name := chat.Name + indicators

	unread := ""
	if chat.UnreadCount > 0 {
		unread = p.styles.UnreadBadge.Render(
			fmt.Sprintf(" (%d)", chat.UnreadCount),
		)
	}

	maxPreview := innerWidth - 4
	if maxPreview < 0 {
		maxPreview = 10
	}

	preview := textutil.Truncate(chat.LastMessage, maxPreview)
	timeStr := textutil.RelativeTime(chat.LastMessageTime)

	previewLine := p.styles.Timestamp.Render(
		fmt.Sprintf("   %s · %s", preview, timeStr),
	)

	// Use bold/bright style for chats with unread messages.
	nameStyle := p.styles.NormalItem
	if chat.UnreadCount > 0 {
		nameStyle = p.styles.UnreadItem
	}

	switch {
	case idx == p.cursor && p.focused:
		line := p.styles.SelectedItem.Render(" > "+name) + unread

		return []string{line, previewLine}
	case idx == p.cursor:
		line := nameStyle.Bold(true).Render(" > "+name) + unread

		return []string{line, previewLine}
	default:
		line := nameStyle.Render("   "+name) + unread

		return []string{line, previewLine}
	}
}

// SetChats updates the chat list.
func (p *ChatsPanel) SetChats(chats []domain.Chat) {
	p.chats = chats
	if p.cursor >= len(chats) {
		p.cursor = max(0, len(chats)-1)
	}

	p.clampOffset()
}

// SelectedChat returns the currently highlighted chat, if any.
func (p *ChatsPanel) SelectedChat() *domain.Chat {
	if len(p.chats) == 0 {
		return nil
	}

	return &p.chats[p.cursor]
}
